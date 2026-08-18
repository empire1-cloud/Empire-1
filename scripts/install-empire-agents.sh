#!/bin/sh
set -eu

CLAUDE_INSTALL_URL="https://claude.ai/install.sh"
CODEX_INSTALL_URL="https://chatgpt.com/codex/install.sh"
PI_INSTALL_URL="https://pi.dev/install.sh"
OPENCODE_INSTALL_URL="https://opencode.ai/install"
RAW_BASE="https://raw.githubusercontent.com/empire1-cloud/Empire-1/main/scripts"
BIN_DIR="${HOME}/.local/bin"
DATA_DIR="${HOME}/.local/share/empire1"

mkdir -p "$BIN_DIR" "$DATA_DIR"

download_run() {
  url=$1
  shell=$2
  tmp=$(mktemp "${TMPDIR:-/tmp}/empire-agent.XXXXXX")
  trap 'rm -f "$tmp"' EXIT INT TERM
  curl -fsSL "$url" -o "$tmp"
  "$shell" "$tmp"
  rm -f "$tmp"
  trap - EXIT INT TERM
}

ask() {
  prompt=$1
  default=${2:-y}
  if [ ! -t 0 ]; then [ "$default" = y ]; return; fi
  if [ "$default" = y ]; then suffix="[Y/n]"; else suffix="[y/N]"; fi
  printf '%s %s ' "$prompt" "$suffix"
  read -r answer || answer=""
  [ -z "$answer" ] && answer=$default
  case "$answer" in y|Y|yes|YES) return 0;; *) return 1;; esac
}

ensure_agent() {
  name=$1
  url=$2
  shell=$3
  if command -v "$name" >/dev/null 2>&1; then
    printf '✓ %s already installed\n' "$name"
  else
    printf 'Installing %s from its official installer...\n' "$name"
    download_run "$url" "$shell"
  fi
}

if ask "Install or verify Claude Code for 'empire claude'?" y; then ensure_agent claude "$CLAUDE_INSTALL_URL" bash; fi
if ask "Install or verify Codex for 'empire codex'?" y; then CODEX_NON_INTERACTIVE=1 ensure_agent codex "$CODEX_INSTALL_URL" sh; fi
if ask "Install or verify Pi for 'empire pi'?" y; then ensure_agent pi "$PI_INSTALL_URL" sh; fi
if ask "Install or verify OpenCode for 'empire opencode'?" y; then ensure_agent opencode "$OPENCODE_INSTALL_URL" bash; fi
if ask "Install or verify Cline CLI for 'empire cline'?" n; then
  if command -v cline >/dev/null 2>&1; then
    printf '✓ cline already installed\n'
  elif command -v npm >/dev/null 2>&1; then
    npm install -g cline
  else
    printf 'Cline requires npm/Node.js.\n' >&2
    exit 1
  fi
fi

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" 2>/dev/null && pwd || true)
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/empire" ] && [ -f "$SCRIPT_DIR/empire_pi_extension.ts" ]; then
  cp "$SCRIPT_DIR/empire" "$BIN_DIR/empire"
  cp "$SCRIPT_DIR/empire_pi_extension.ts" "$DATA_DIR/empire_pi_extension.ts"
else
  curl -fsSL "$RAW_BASE/empire" -o "$BIN_DIR/empire"
  curl -fsSL "$RAW_BASE/empire_pi_extension.ts" -o "$DATA_DIR/empire_pi_extension.ts"
fi
chmod +x "$BIN_DIR/empire"

printf '\nEmpire-1 agent launchers installed.\n'
printf 'Set EMPIRE_ROUTER_URL if your router is not http://127.0.0.1:8000/empire1/router\n'
printf 'Then run: empire doctor\n'
