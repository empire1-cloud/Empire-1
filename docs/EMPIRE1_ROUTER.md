# Empire-1 Router

Empire-1 Router is one inference front door for compatible coding agents and model providers.
It is part of Empire-1. It is not a separate product and does not depend on FCC at runtime.

## What it does

- Accepts Anthropic Messages traffic at `/empire1/router/v1/messages`.
- Accepts OpenAI Chat Completions at `/empire1/router/v1/chat/completions`.
- Accepts OpenAI Responses traffic at `/empire1/router/v1/responses`.
- Resolves `provider/model` references directly.
- Maps ordinary agent model names through `EMPIRE_ROUTER_MODEL` with optional fallbacks.
- Exposes `/empire1/router/v1/models`, `/providers`, and `/health`.
- Lets the real Claude Code, Codex, OpenCode, Pi, and Cline clients run through Empire-1 with process-local configuration.

## Configure a route

Example with an OpenRouter key and its free router model:

```bash
export OPENROUTER_API_KEY=...
export EMPIRE_ROUTER_MODEL='open_router/openrouter/free'
```

Example local model:

```bash
export EMPIRE_ROUTER_MODEL='ollama/qwen2.5-coder:7b'
export OLLAMA_BASE_URL='http://127.0.0.1:11434/v1'
```

Optional fallback chain:

```bash
export EMPIRE_ROUTER_FALLBACKS='groq/your-model,gemini/your-model,ollama/your-model'
```

The router only uses a route when its required credential/configuration is present. Free-tier availability and provider terms are controlled by each provider; Empire-1 does not pool or resell somebody else's personal free account.

## Run

From the Empire-1 checkout:

```bash
./scripts/empire-server
```

Or run the existing backend normally. The router is mounted inside the same FastAPI application.

## Install agent launchers

```bash
./scripts/install-empire-agents.sh
```

The installer uses the agents' official installers when an agent is missing, then installs the single `empire` launcher.

```bash
empire doctor
empire models
empire claude
empire codex
empire opencode
empire pi
empire cline
```

Ordinary agent configuration is not replaced. The Empire settings are applied only to the child process launched by `empire`.

## Provider catalog

The built-in catalog includes OpenAI-compatible routes for NVIDIA NIM, OpenRouter, Groq, OpenAI, xAI, QwenCloud, Together, DeepInfra, SiliconFlow, Nebius, Chutes, Featherless, Agnes, ZenMux, W&B Inference, Azure OpenAI, Gemini, DeepSeek, Mistral/Codestral, OpenCode Zen/Go, Vercel AI Gateway, Bedrock, Hugging Face, Cohere, GitHub Models, Wafer, Kimi/Kimi Code, MiniMax, Cerebras, SambaNova, Kilo, Fireworks, Novita, Z.ai, TokenRouter, NaraRoute, Ollama Cloud, LM Studio, llama.cpp, and Ollama.

Credentials are always read from the user's/server's own environment. No provider credential is committed to the repository.

## FCC attribution

The architecture and client-launcher patterns were studied from the MIT-licensed Free Claude Code project by Ali Khokhar. Empire-1 reimplements the pattern under its own namespace and runtime. See `THIRD_PARTY_NOTICES.md`.
