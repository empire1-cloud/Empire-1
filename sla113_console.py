#!/usr/bin/env python3
"""
SLA113 Operator Console — CLI + REPL
Usage (CLI):   sla113 <command> [args] [--flags]
Usage (REPL):  sla113          (no args → interactive mode)

Environment variables:
  SLA113_BACKEND_URL   Base URL of the SLA113 backend  (default: http://localhost:8000)
  SLA113_ADMIN_KEY     Operator key for X-SLA113-Key   (default: dev-admin-key)
  SLA113_ROLE          Operator role header             (default: operator_advanced)

Commands:
  status
  context
  tenants
  tenant <id>
  engines
  engine <id>
  regulatory [jurisdiction]
  validate <jurisdiction> [--session MIN] [--loss PCT] [--age AGE] [--bet AMT] [--rtp RTP]
  orchestrate [--tenant ID] [--machine ID] [--bet AMT] [--spins N]
              [--losses N] [--balance F] [--buyin F] [--jurisdiction J] [--bonus]
  logs [--tail N]
  fault [--recent] [--code CODE] [--sev SEV]
  help
"""

import os
import sys
import json
import textwrap
import argparse
import shlex

try:
    import requests
except ImportError:
    print("[FATAL] 'requests' package required.  Run: pip3 install requests")
    sys.exit(1)

# =============================================================================
# CONFIG
# =============================================================================
BASE_URL = os.environ.get("SLA113_BACKEND_URL", "http://localhost:8000").rstrip("/")
ADMIN_KEY = os.environ.get("SLA113_ADMIN_KEY", "dev-admin-key")
ROLE      = os.environ.get("SLA113_ROLE", "operator_advanced")

HEADERS = {
    "X-SLA113-Key":  ADMIN_KEY,
    "X-SLA113-Role": ROLE,
    "Content-Type":  "application/json",
}

# =============================================================================
# HTTP HELPERS
# =============================================================================

def _get(path, params=None):
    try:
        r = requests.get(f"{BASE_URL}{path}", headers=HEADERS, params=params, timeout=10)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        return {"error": "CONNECTION_REFUSED", "backend": BASE_URL}
    except requests.exceptions.HTTPError as e:
        try:
            return {"error": e.response.json()}
        except Exception:
            return {"error": str(e)}
    except Exception as e:
        return {"error": str(e)}


def _post(path, body):
    try:
        r = requests.post(f"{BASE_URL}{path}", headers=HEADERS, json=body, timeout=30)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        return {"error": "CONNECTION_REFUSED", "backend": BASE_URL}
    except requests.exceptions.HTTPError as e:
        try:
            return {"error": e.response.json()}
        except Exception:
            return {"error": str(e)}
    except Exception as e:
        return {"error": str(e)}


def _out(data):
    print(json.dumps(data, indent=2, default=str))

# =============================================================================
# ARGUMENT PARSER
# =============================================================================

def _build_parser():
    p = argparse.ArgumentParser(prog="sla113", add_help=False)
    sub = p.add_subparsers(dest="command")

    sub.add_parser("status")
    sub.add_parser("context")
    sub.add_parser("tenants")
    sub.add_parser("engines")
    sub.add_parser("help")

    t = sub.add_parser("tenant")
    t.add_argument("id")

    eng = sub.add_parser("engine")
    eng.add_argument("id")

    reg = sub.add_parser("regulatory")
    reg.add_argument("jurisdiction", nargs="?", default=None)

    val = sub.add_parser("validate")
    val.add_argument("jurisdiction")
    val.add_argument("--session", dest="session_minutes", type=float, default=0.0, metavar="MIN")
    val.add_argument("--loss",    dest="loss_pct",        type=float, default=0.0, metavar="PCT")
    val.add_argument("--age",     dest="age",             type=int,   default=None)
    val.add_argument("--bet",     dest="bet",             type=float, default=1.0)
    val.add_argument("--rtp",     dest="rtp",             type=float, default=0.95)

    orch = sub.add_parser("orchestrate")
    orch.add_argument("--tenant",       dest="tenant_id",    default="southern_lyfestyle_arcade")
    orch.add_argument("--machine",      dest="machine_type", default="fish_shooting")
    orch.add_argument("--bet",          dest="bet",          type=float, default=1.0)
    orch.add_argument("--spins",        dest="spins",        type=int,   default=0)
    orch.add_argument("--losses",       dest="losses",       type=int,   default=0)
    orch.add_argument("--balance",      dest="balance",      type=float, default=100.0)
    orch.add_argument("--buyin",        dest="buyin",        type=float, default=100.0)
    orch.add_argument("--jurisdiction", dest="jurisdiction", default="nevada_lvcc")
    orch.add_argument("--bonus",        dest="bonus",        action="store_true")

    lg = sub.add_parser("logs")
    lg.add_argument("--tail", dest="tail", type=int, default=50, metavar="N")

    flt = sub.add_parser("fault")
    flt.add_argument("--recent",            action="store_true")
    flt.add_argument("--code", dest="code", default=None)
    flt.add_argument("--sev",  dest="sev",  type=float, default=1.0)

    return p

# =============================================================================
# COMMAND HANDLERS
# =============================================================================

def run_status(_ns):
    _out(_get("/sla113/health"))

def run_context(_ns):
    _out(_get("/sla113/dashboard/context"))

def run_tenants(_ns):
    _out(_get("/sla113/admin/tenants"))

def run_tenant(ns):
    _out(_get(f"/sla113/admin/tenant/{ns.id}"))

def run_engines(_ns):
    _out(_get("/sla113/engines/dashboard"))

def run_engine(ns):
    if ns.id in ("orchestration", "orchestrate"):
        # Return orchestration engine spec from Build Spec
        _out(_get("/sla113/orchestration/spec"))
    else:
        _out(_get(f"/sla113/engines/{ns.id}"))

def run_regulatory(ns):
    if ns.jurisdiction:
        _out(_get(f"/sla113/regulatory/{ns.jurisdiction}"))
    else:
        _out(_get("/sla113/regulatory"))

def run_validate(ns):
    body = {
        "jurisdiction":             ns.jurisdiction,
        "rtp":                      ns.rtp,
        "bet_amount":               ns.bet,
        "session_duration_minutes": ns.session_minutes,
        "session_loss_pct":         (ns.loss_pct or 0.0) / 100.0,
    }
    if ns.age is not None:
        body["player_age"] = ns.age
    _out(_post("/sla113/regulatory/validate", body))

def run_orchestrate(ns):
    _out(_post("/sla113/orchestrate", {
        "tenant_id":                ns.tenant_id,
        "player_id":                "console_operator",
        "machine_type":             ns.machine_type,
        "jurisdiction":             ns.jurisdiction,
        "buy_in_amount":            ns.buyin,
        "current_balance":          ns.balance,
        "spin_count":               ns.spins,
        "consecutive_losses":       ns.losses,
        "is_bonus_round":           ns.bonus,
        "session_duration_minutes": 0.0,
        "custom":                   {"bet_amount": ns.bet},
    }))

def run_logs(ns):
    _out(_get("/sla113/logs", params={"limit": ns.tail}))

def run_fault(ns):
    if ns.recent or not ns.code:
        _out(_get("/sla113/logs/recent", params={"limit": 50}))
    else:
        _out(_post("/sla113/admin/engine/invoke", {
            "tenant_id": "empire1",
            "engine":    "fault",
            "action":    "analyze",
            "payload":   {"code": ns.code, "severity": ns.sev},
        }))

def run_help(_ns):
    print(textwrap.dedent("""
    SLA113 OPERATOR CONSOLE — COMMAND REFERENCE
    ============================================
    sla113 status
    sla113 context
    sla113 tenants
    sla113 tenant <id>
    sla113 engines
    sla113 engine <id>
    sla113 regulatory [jurisdiction]
    sla113 validate <jurisdiction> [--session MIN] [--loss PCT] [--age AGE] [--bet AMT] [--rtp RTP]
    sla113 orchestrate [--tenant ID] [--machine ID] [--bet AMT] [--spins N]
                       [--losses N] [--balance F] [--buyin F] [--jurisdiction J] [--bonus]
    sla113 logs [--tail N]
    sla113 fault [--recent] [--code CODE] [--sev SEV]
    sla113 help

    Jurisdictions: nevada_lvcc | uk_gbga | australia_ilga | us_ca_high_compliance
    Roles:         operator_standard | operator_advanced | operator_executive | engineer_platform
    """).strip())

HANDLERS = {
    "status":      run_status,
    "context":     run_context,
    "tenants":     run_tenants,
    "tenant":      run_tenant,
    "engines":     run_engines,
    "engine":      run_engine,
    "regulatory":  run_regulatory,
    "validate":    run_validate,
    "orchestrate": run_orchestrate,
    "logs":        run_logs,
    "fault":       run_fault,
    "help":        run_help,
}

# =============================================================================
# DISPATCH
# =============================================================================

def _dispatch(argv):
    parser = _build_parser()
    try:
        ns, _ = parser.parse_known_args(argv)
    except SystemExit:
        return
    if not ns.command:
        run_help(None)
        return
    handler = HANDLERS.get(ns.command)
    if handler:
        handler(ns)
    else:
        print(f"[ERROR] Unknown command: {ns.command!r}.  Run 'sla113 help'.")

# =============================================================================
# ENTRY POINTS
# =============================================================================

def main():
    cli_args = sys.argv[1:]

    # CLI mode
    if cli_args:
        _dispatch(cli_args)
        return

    # REPL mode
    key_display = ('*' * max(0, len(ADMIN_KEY) - 4) + ADMIN_KEY[-4:]) if ADMIN_KEY else "(none)"
    print(f"SLA113 OPERATOR CONSOLE")
    print(f"  Backend : {BASE_URL}")
    print(f"  Role    : {ROLE}")
    print(f"  Key     : {key_display}")
    print(f"  Type 'help' for commands, 'exit' to quit.\n")

    while True:
        try:
            raw = input("SLA113> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n[SLA113] Session terminated.")
            break
        if not raw:
            continue
        if raw.lower() in ("exit", "quit"):
            print("[SLA113] Session terminated.")
            break
        # Strip leading "sla113 " if typed inside REPL
        if raw.lower().startswith("sla113 "):
            raw = raw[7:]
        try:
            parts = shlex.split(raw)
        except ValueError as e:
            print(f"[ERROR] {e}")
            continue
        _dispatch(parts)


if __name__ == "__main__":
    main()
