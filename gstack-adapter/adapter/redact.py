"""Secret redaction for text served out of ~/.gstack artifacts.

gstack artifacts are human-authored markdown and JSONL, but plans and
checkpoints occasionally quote shell output or config. Anything that looks
like a credential is masked before it leaves this process. Patterns err on
the side of masking too much: a mangled doc is recoverable, a leaked key
is not.
"""

from __future__ import annotations

import re

_PATTERNS: list[re.Pattern[str]] = [
    # Provider-prefixed tokens (Supabase, Stripe, OpenAI, Slack, GitHub, ...)
    re.compile(r"\b(?:sbp|sk|pk|rk|whsec|xox[abps]|ghp|gho|ghu|ghs|glpat|npm)_[A-Za-z0-9_\-]{10,}\b"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),  # AWS access key id
    # key=value / key: value assignments for credential-ish names
    re.compile(
        r"(?i)\b((?:api[_-]?key|apikey|secret|token|passwd|password|access[_-]?key|private[_-]?key|client[_-]?secret|auth)[\"']?\s*[:=]\s*[\"']?)[^\s\"',;]{6,}"
    ),
    re.compile(r"(?i)\bbearer\s+[A-Za-z0-9_\-.=]{16,}\b"),
    # Connection strings with embedded credentials
    re.compile(r"\b[a-z][a-z0-9+.-]*://[^\s/@:]+:[^\s@]+@"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----(?:.|\n)*?-----END [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{5,}\b"),  # JWT
]

MASK = "[REDACTED]"


def redact(text: str) -> str:
    for pattern in _PATTERNS:
        if pattern.groups:
            text = pattern.sub(lambda m: m.group(1) + MASK, text)
        else:
            text = pattern.sub(MASK, text)
    return text
