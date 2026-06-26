"""
Lyrica Micro-Royalty Ledger — VICS Protocol.

Fractional USD routing with ArchiSynapse transaction settlement.
No middlemen. No labels. Direct creator-to-wallet.

Territory multipliers:
  US=1.0, EU=0.85, LATAM=0.6, APAC=0.7

Base rate: $0.004/stream (industry standard).

Flip It Protocol: Child tracks only minted if fractional micro-royalties
are atomically guaranteed to parent contributors.
"""

import uuid
import json
import logging
import os
import asyncio
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

ARCHISYNAPSE_API_URL = os.getenv(
    "ARCHISYNAPSE_API_URL",
    "http://localhost:3000/api/v1",
)
ARCHISYNAPSE_API_KEY = os.getenv("ARCHISYNAPSE_API_KEY", "")

BASE_RATE_USD = 0.004

TERRITORY_MULTIPLIERS = {
    "US": 1.0,
    "EU": 0.85,
    "LATAM": 0.6,
    "APAC": 0.7,
    "GLOBAL": 0.75,
}


def calculate_micro_royalty(
    track_id: str,
    streams: int,
    territory: str = "US",
    splits: Optional[dict] = None,
) -> dict:
    """
    Calculate fractional USD distribution across contributors.
    Returns ledger entries ready for MongoDB commit.
    """
    t_mult = TERRITORY_MULTIPLIERS.get(territory, 0.5)
    gross_royalty = streams * BASE_RATE_USD * t_mult

    if not splits:
        splits = {"creator": 1.0}

    total_fraction = sum(splits.values())
    if abs(total_fraction - 1.0) > 0.001:
        raise ValueError(f"Split fractions must sum to 1.0, got {total_fraction}")

    ledger_entries = []
    for contributor_id, fraction in splits.items():
        net_payout = gross_royalty * fraction
        ledger_entries.append({
            "entry_id": str(uuid.uuid4()),
            "track_id": track_id,
            "contributor_id": contributor_id,
            "fraction": fraction,
            "accumulated_usd": round(net_payout, 6),
            "territory": territory,
            "territory_multiplier": t_mult,
            "streams": streams,
            "base_rate": BASE_RATE_USD,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    return {
        "track_id": track_id,
        "gross_royalty_usd": round(gross_royalty, 6),
        "territory": territory,
        "territory_multiplier": t_mult,
        "streams": streams,
        "contributors": len(splits),
        "ledger_entries": ledger_entries,
    }


async def commit_to_mongodb(ledger_result: dict, db) -> dict:
    """
    Legacy MongoDB upsert for backward compatibility.
    Prefer commit_and_settle() for real ArchiSynapse settlement.
    """
    committed = 0
    for entry in ledger_result["ledger_entries"]:
        await db.royalty_ledger.update_one(
            {
                "contributor_id": entry["contributor_id"],
                "track_id": entry["track_id"],
            },
            {
                "$inc": {"accumulated_usd": entry["accumulated_usd"]},
                "$set": {
                    "fraction": entry["fraction"],
                    "territory": entry["territory"],
                    "status": entry["status"],
                    "last_stream_logged": datetime.now(timezone.utc).isoformat(),
                },
                "$setOnInsert": {
                    "entry_id": entry["entry_id"],
                    "created_at": entry["created_at"],
                },
            },
            upsert=True,
        )
        committed += 1

    logger.info(
        "[VICS] MongoDB committed: $%.2f across %d creators for %s",
        ledger_result["gross_royalty_usd"],
        committed,
        ledger_result["track_id"],
    )

    return {
        "committed": committed,
        "track_id": ledger_result["track_id"],
        "gross_usd": ledger_result["gross_royalty_usd"],
    }


def _post_transaction(payload: dict) -> dict:
    """Synchronous HTTP POST to ArchiSynapse (runs in executor)."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{ARCHISYNAPSE_API_URL}/transactions",
        data=data,
        headers={
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {ARCHISYNAPSE_API_KEY}"} if ARCHISYNAPSE_API_KEY else {}),
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return {"ok": True, "status": resp.status, "body": body}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")[:200]
        return {"ok": False, "status": e.code, "error": error_body}
    except Exception as e:
        return {"ok": False, "status": None, "error": str(e)}


async def archisynapse_settle(ledger_result: dict) -> dict:
    """
    Post each contributor's royalty share as a real ArchiSynapse transaction.
    Replaces the stub where amount_usd was logged as 0.0.
    """
    settled = {"transactions": [], "failed": []}
    loop = asyncio.get_event_loop()

    for entry in ledger_result["ledger_entries"]:
        payload = {
            "amount": entry["accumulated_usd"],
            "currency": "USD",
            "type": "stream_royalty",
            "description": (
                f"VICS micro-royalty: {entry['streams']} streams @ "
                f"${entry['base_rate']}/stream ({entry['territory']}, "
                f"x{entry['territory_multiplier']}) — track {entry['track_id']}"
            ),
            "customer": {
                "id": entry["contributor_id"],
                "email": f"{entry['contributor_id']}@vics.example.com",
            },
            "payment_method": {"type": "vics_ledger"},
            "metadata": {
                "track_id": entry["track_id"],
                "streams": entry["streams"],
                "territory": entry["territory"],
                "territory_multiplier": entry["territory_multiplier"],
                "fraction": entry["fraction"],
                "base_rate": entry["base_rate"],
                "entry_id": entry["entry_id"],
                "source": "vics_ledger",
            },
        }

        result = await loop.run_in_executor(None, _post_transaction, payload)

        if result["ok"]:
            txn = result["body"]
            settled["transactions"].append({
                "contributor_id": entry["contributor_id"],
                "amount": entry["accumulated_usd"],
                "transaction_id": txn.get("id"),
            })
            logger.info(
                "[VICS] ArchiSynapse settled: %s → $%.4f for %s (txn=%s)",
                entry["track_id"],
                entry["accumulated_usd"],
                entry["contributor_id"],
                txn.get("id"),
            )
        else:
            settled["failed"].append({
                "contributor_id": entry["contributor_id"],
                "amount": entry["accumulated_usd"],
                "reason": result.get("error") or f"HTTP {result['status']}",
            })
            logger.error(
                "[VICS] ArchiSynapse settle failed for %s / %s: %s",
                entry["track_id"],
                entry["contributor_id"],
                result.get("error"),
            )

    return {
        "settled": len(settled["transactions"]),
        "failed": len(settled["failed"]),
        "gross_usd": ledger_result["gross_royalty_usd"],
        "track_id": ledger_result["track_id"],
        "details": settled,
    }


def validate_flip_it(parent_dna_tag: str, child_splits: dict, parent_splits: dict) -> dict:
    """
    Flip It Protocol validation.
    Child track can only be minted if parent contributors get their cut.
    """
    for parent_id, parent_fraction in parent_splits.items():
        if parent_id not in child_splits:
            return {
                "valid": False,
                "reason": f"Parent contributor '{parent_id}' not found in child splits",
                "required_minimum": parent_fraction * 0.15,
            }

        child_fraction = child_splits[parent_id]
        minimum_required = parent_fraction * 0.15
        if child_fraction < minimum_required:
            return {
                "valid": False,
                "reason": f"Contributor '{parent_id}' gets {child_fraction:.4f} but minimum is {minimum_required:.4f} (15% of parent share)",
                "required_minimum": minimum_required,
            }

    return {
        "valid": True,
        "parent_dna_tag": parent_dna_tag,
        "message": "Flip It protocol satisfied. Child track cleared for minting.",
    }
