#!/usr/bin/env python3
"""FABLE-5 -> Empire-1 CRM bridge client.

Uses only the Python standard library so it can run in constrained agent
sandboxes. It never enriches or invents data itself; it transports grounded
prospect records and evidence into the Empire-1 CRM API.

Environment:
    EMPIRE_CRM_URL=http://localhost:8001/api/crm
    CRM_INTEGRATION_KEY=<secret>
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class BridgeError(RuntimeError):
    """Raised when the CRM bridge cannot complete a request."""


class EmpireCRMClient:
    def __init__(self, base_url: str, integration_key: str, timeout: int = 30):
        self.base_url = base_url.rstrip("/")
        self.integration_key = integration_key
        self.timeout = timeout

    def request(
        self,
        method: str,
        path: str,
        *,
        payload: dict[str, Any] | None = None,
        query: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = f"{self.base_url}/{path.lstrip('/')}"
        if query:
            url = f"{url}?{urlencode(query)}"
        body = None
        headers = {
            "Accept": "application/json",
            "X-CRM-Integration-Key": self.integration_key,
        }
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"

        request = Request(url, data=body, headers=headers, method=method.upper())
        try:
            with urlopen(request, timeout=self.timeout) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise BridgeError(f"CRM returned HTTP {exc.code}: {detail}") from exc
        except URLError as exc:
            raise BridgeError(f"Could not reach CRM at {url}: {exc.reason}") from exc
        except json.JSONDecodeError as exc:
            raise BridgeError(f"CRM returned invalid JSON from {url}") from exc

    def manifest(self) -> dict[str, Any]:
        return self.request("GET", "/integrations/manifest")

    def import_prospects(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.request("POST", "/integrations/prospects/import", payload=payload)

    def outreach_ready(self, limit: int = 100) -> dict[str, Any]:
        return self.request(
            "GET",
            "/integrations/prospects/outreach-ready",
            query={"limit": limit},
        )

    def append_receipt(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.request("POST", "/receipts", payload=payload)

    def verify_receipt(
        self, receipt_id: str, payload: dict[str, Any]
    ) -> dict[str, Any]:
        return self.request(
            "POST",
            f"/receipts/{receipt_id}/verify",
            payload=payload,
        )


def load_json(path: str) -> dict[str, Any]:
    file_path = Path(path)
    if not file_path.is_file():
        raise BridgeError(f"JSON file not found: {file_path}")
    try:
        value = json.loads(file_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise BridgeError(f"Invalid JSON in {file_path}: {exc}") from exc
    if not isinstance(value, dict):
        raise BridgeError(f"Expected a JSON object in {file_path}")
    return value


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Send grounded FABLE prospecting data to Empire-1 CRM."
    )
    parser.add_argument(
        "--url",
        default=os.environ.get(
            "EMPIRE_CRM_URL", "http://localhost:8001/api/crm"
        ),
        help="CRM base URL (default: EMPIRE_CRM_URL or local backend)",
    )
    parser.add_argument(
        "--key",
        default=os.environ.get("CRM_INTEGRATION_KEY"),
        help="Integration key (default: CRM_INTEGRATION_KEY)",
    )
    parser.add_argument("--timeout", type=int, default=30)

    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("manifest", help="Read connector capabilities")

    import_parser = subparsers.add_parser(
        "import", help="Import a grounded prospect batch"
    )
    import_parser.add_argument("json_file")

    ready_parser = subparsers.add_parser(
        "ready", help="List grounded outreach-ready prospects"
    )
    ready_parser.add_argument("--limit", type=int, default=100)

    receipt_parser = subparsers.add_parser(
        "receipt", help="Append an evidence receipt"
    )
    receipt_parser.add_argument("json_file")

    verify_parser = subparsers.add_parser(
        "verify", help="Append independent receipt verification"
    )
    verify_parser.add_argument("receipt_id")
    verify_parser.add_argument("json_file")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if not args.key:
        parser.error("CRM integration key is required via --key or CRM_INTEGRATION_KEY")

    client = EmpireCRMClient(args.url, args.key, timeout=args.timeout)
    try:
        if args.command == "manifest":
            result = client.manifest()
        elif args.command == "import":
            result = client.import_prospects(load_json(args.json_file))
        elif args.command == "ready":
            result = client.outreach_ready(args.limit)
        elif args.command == "receipt":
            result = client.append_receipt(load_json(args.json_file))
        elif args.command == "verify":
            result = client.verify_receipt(
                args.receipt_id, load_json(args.json_file)
            )
        else:
            parser.error(f"Unknown command: {args.command}")
            return 2
    except BridgeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
