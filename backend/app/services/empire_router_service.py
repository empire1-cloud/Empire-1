"""Empire-1 model routing service.

One router surface, many compatible inference providers. The service keeps
provider selection explicit: provider/model references route directly, while
ordinary agent model names route through EMPIRE_ROUTER_MODEL and optional
EMPIRE_ROUTER_FALLBACKS.
"""

from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import dataclass
from typing import Any, AsyncIterator

import httpx


class EmpireRouterError(RuntimeError):
    def __init__(self, message: str, *, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True, slots=True)
class ProviderDescriptor:
    provider_id: str
    display_name: str
    base_url: str
    credential_env: str | None = None
    base_url_env: str | None = None
    auth_header: str = "authorization"
    local: bool = False

    def resolved_base_url(self) -> str:
        if self.base_url_env:
            override = os.getenv(self.base_url_env, "").strip()
            if override:
                return override.rstrip("/")
        return self.base_url.rstrip("/")

    def credential(self) -> str:
        return os.getenv(self.credential_env, "").strip() if self.credential_env else ""

    def configured(self) -> bool:
        if self.local:
            return True
        return bool(self.credential())


# OpenAI-compatible provider catalog. The design was informed by the public,
# MIT-licensed Free Claude Code provider-router pattern; Empire-1 does not depend
# on FCC at runtime.
PROVIDERS: dict[str, ProviderDescriptor] = {
    "nvidia_nim": ProviderDescriptor("nvidia_nim", "NVIDIA NIM", "https://integrate.api.nvidia.com/v1", "NVIDIA_NIM_API_KEY"),
    "open_router": ProviderDescriptor("open_router", "OpenRouter", "https://openrouter.ai/api/v1", "OPENROUTER_API_KEY"),
    "groq": ProviderDescriptor("groq", "Groq", "https://api.groq.com/openai/v1", "GROQ_API_KEY"),
    "openai": ProviderDescriptor("openai", "OpenAI", "https://api.openai.com/v1", "OPENAI_API_KEY"),
    "xai": ProviderDescriptor("xai", "xAI", "https://api.x.ai/v1", "XAI_API_KEY"),
    "qwencloud": ProviderDescriptor("qwencloud", "QwenCloud Token Plan", "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1", "QWENCLOUD_API_KEY"),
    "qwencloud_coding": ProviderDescriptor("qwencloud_coding", "QwenCloud Coding Plan", "https://coding-intl.dashscope.aliyuncs.com/v1", "QWENCLOUD_CODING_API_KEY"),
    "together": ProviderDescriptor("together", "Together AI", "https://api.together.ai/v1", "TOGETHER_API_KEY"),
    "deepinfra": ProviderDescriptor("deepinfra", "DeepInfra", "https://api.deepinfra.com/v1/openai", "DEEPINFRA_API_KEY"),
    "siliconflow": ProviderDescriptor("siliconflow", "SiliconFlow", "https://api.siliconflow.com/v1", "SILICONFLOW_API_KEY"),
    "nebius": ProviderDescriptor("nebius", "Nebius Token Factory", "https://api.tokenfactory.nebius.com/v1", "NEBIUS_API_KEY"),
    "chutes": ProviderDescriptor("chutes", "Chutes", "https://llm.chutes.ai/v1", "CHUTES_API_KEY"),
    "featherless": ProviderDescriptor("featherless", "Featherless AI", "https://api.featherless.ai/v1", "FEATHERLESS_API_KEY"),
    "agnes": ProviderDescriptor("agnes", "Agnes AI", "https://apihub.agnes-ai.com/v1", "AGNES_API_KEY"),
    "zenmux": ProviderDescriptor("zenmux", "ZenMux", "https://zenmux.ai/api/v1", "ZENMUX_API_KEY"),
    "wandb": ProviderDescriptor("wandb", "W&B Inference", "https://api.inference.wandb.ai/v1", "WANDB_API_KEY"),
    "azure_openai": ProviderDescriptor("azure_openai", "Azure OpenAI", "", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_BASE_URL", "api-key"),
    "gemini": ProviderDescriptor("gemini", "Google AI Studio", "https://generativelanguage.googleapis.com/v1beta/openai", "GEMINI_API_KEY"),
    "deepseek": ProviderDescriptor("deepseek", "DeepSeek", "https://api.deepseek.com", "DEEPSEEK_API_KEY"),
    "mistral": ProviderDescriptor("mistral", "Mistral", "https://api.mistral.ai/v1", "MISTRAL_API_KEY"),
    "mistral_codestral": ProviderDescriptor("mistral_codestral", "Mistral Codestral", "https://codestral.mistral.ai/v1", "CODESTRAL_API_KEY"),
    "opencode_zen": ProviderDescriptor("opencode_zen", "OpenCode Zen", "https://opencode.ai/zen/v1", "OPENCODE_API_KEY"),
    "opencode_go": ProviderDescriptor("opencode_go", "OpenCode Go", "https://opencode.ai/zen/go/v1", "OPENCODE_API_KEY"),
    "vercel": ProviderDescriptor("vercel", "Vercel AI Gateway", "https://ai-gateway.vercel.sh/v1", "AI_GATEWAY_API_KEY"),
    "bedrock": ProviderDescriptor("bedrock", "Amazon Bedrock", "https://bedrock-mantle.us-east-1.api.aws/v1", "AWS_BEARER_TOKEN_BEDROCK", "BEDROCK_BASE_URL"),
    "huggingface": ProviderDescriptor("huggingface", "Hugging Face Inference", "https://router.huggingface.co/v1", "HUGGINGFACE_API_KEY"),
    "cohere": ProviderDescriptor("cohere", "Cohere", "https://api.cohere.ai/compatibility/v1", "COHERE_API_KEY"),
    "github_models": ProviderDescriptor("github_models", "GitHub Models", "https://models.github.ai/inference", "GITHUB_MODELS_TOKEN"),
    "wafer": ProviderDescriptor("wafer", "Wafer", "https://pass.wafer.ai/v1", "WAFER_API_KEY"),
    "kimi": ProviderDescriptor("kimi", "Kimi API", "https://api.moonshot.ai/v1", "KIMI_API_KEY"),
    "kimi_code": ProviderDescriptor("kimi_code", "Kimi Code", "https://api.kimi.com/coding/v1", "KIMI_CODE_API_KEY"),
    "minimax": ProviderDescriptor("minimax", "MiniMax", "https://api.minimax.io/v1", "MINIMAX_API_KEY"),
    "cerebras": ProviderDescriptor("cerebras", "Cerebras", "https://api.cerebras.ai/v1", "CEREBRAS_API_KEY"),
    "sambanova": ProviderDescriptor("sambanova", "SambaNova", "https://api.sambanova.ai/v1", "SAMBANOVA_API_KEY"),
    "kilo": ProviderDescriptor("kilo", "Kilo.ai", "https://api.kilo.ai/api/gateway", "KILO_API_KEY"),
    "fireworks": ProviderDescriptor("fireworks", "Fireworks AI", "https://api.fireworks.ai/inference/v1", "FIREWORKS_API_KEY"),
    "novita": ProviderDescriptor("novita", "Novita AI", "https://api.novita.ai/openai/v1", "NOVITA_API_KEY"),
    "zai": ProviderDescriptor("zai", "Z.ai Coding", "https://api.z.ai/api/coding/paas/v4", "ZAI_API_KEY"),
    "zai_api": ProviderDescriptor("zai_api", "Z.ai API", "https://api.z.ai/api/paas/v4", "ZAI_API_KEY"),
    "tokenrouter": ProviderDescriptor("tokenrouter", "TokenRouter", "https://api.tokenrouter.com/v1", "TOKENROUTER_API_KEY"),
    "nararoute": ProviderDescriptor("nararoute", "NaraRoute", "https://router.bynara.id/v1", "NARAROUTE_API_KEY"),
    "ollama_cloud": ProviderDescriptor("ollama_cloud", "Ollama Cloud", "https://ollama.com/v1", "OLLAMA_API_KEY"),
    "lmstudio": ProviderDescriptor("lmstudio", "LM Studio", "http://127.0.0.1:1234/v1", base_url_env="LM_STUDIO_BASE_URL", local=True),
    "llamacpp": ProviderDescriptor("llamacpp", "llama.cpp", "http://127.0.0.1:8080/v1", base_url_env="LLAMACPP_BASE_URL", local=True),
    "ollama": ProviderDescriptor("ollama", "Ollama", "http://127.0.0.1:11434/v1", base_url_env="OLLAMA_BASE_URL", local=True),
}


@dataclass(frozen=True, slots=True)
class ResolvedRoute:
    requested_model: str
    provider_id: str
    provider_model: str
    provider: ProviderDescriptor

    @property
    def ref(self) -> str:
        return f"{self.provider_id}/{self.provider_model}"


def configured_route_refs() -> list[str]:
    refs: list[str] = []
    primary = os.getenv("EMPIRE_ROUTER_MODEL", "").strip()
    if primary:
        refs.append(primary)
    refs.extend(part.strip() for part in os.getenv("EMPIRE_ROUTER_FALLBACKS", "").split(",") if part.strip())
    extra = os.getenv("EMPIRE_ROUTER_MODELS", "").strip()
    if extra:
        try:
            parsed = json.loads(extra)
        except json.JSONDecodeError:
            parsed = []
        if isinstance(parsed, list):
            refs.extend(str(value).strip() for value in parsed if str(value).strip())
    return list(dict.fromkeys(refs))


def resolve_route(requested_model: str) -> ResolvedRoute:
    requested_model = (requested_model or "").strip()
    provider_id, separator, provider_model = requested_model.partition("/")
    if separator and provider_id in PROVIDERS and provider_model:
        return direct_route(provider_id, provider_model, requested_model)

    refs = configured_route_refs()
    if not refs:
        raise EmpireRouterError("Empire-1 Router has no default model. Set EMPIRE_ROUTER_MODEL to provider/model.", status_code=503)

    errors: list[str] = []
    for ref in refs:
        candidate_provider, sep, candidate_model = ref.partition("/")
        if not sep or candidate_provider not in PROVIDERS or not candidate_model:
            errors.append(f"invalid route {ref!r}")
            continue
        provider = PROVIDERS[candidate_provider]
        if provider.configured():
            return ResolvedRoute(requested_model, candidate_provider, candidate_model, provider)
        errors.append(f"{candidate_provider} is not configured")
    raise EmpireRouterError("No configured Empire-1 inference route is available: " + "; ".join(errors), status_code=503)


def direct_route(provider_id: str, provider_model: str, requested_model: str) -> ResolvedRoute:
    provider = PROVIDERS[provider_id]
    if not provider.configured():
        env = provider.credential_env or provider.base_url_env or "provider configuration"
        raise EmpireRouterError(f"Provider {provider_id!r} is not configured ({env}).", status_code=503)
    return ResolvedRoute(requested_model, provider_id, provider_model, provider)


def provider_snapshot() -> list[dict[str, Any]]:
    return [{"id": p.provider_id, "name": p.display_name, "configured": p.configured(), "local": p.local, "credential_env": p.credential_env, "base_url_env": p.base_url_env} for p in PROVIDERS.values()]


def model_catalog() -> dict[str, Any]:
    return {"object": "list", "data": [{"id": ref, "object": "model", "owned_by": "empire-1"} for ref in configured_route_refs()]}


def provider_headers(route: ResolvedRoute) -> dict[str, str]:
    headers = {"content-type": "application/json"}
    credential = route.provider.credential()
    if credential:
        if route.provider.auth_header == "api-key":
            headers["api-key"] = credential
        else:
            headers["authorization"] = f"Bearer {credential}"
    return headers


def upstream_url(route: ResolvedRoute, endpoint: str) -> str:
    base = route.provider.resolved_base_url()
    if not base:
        raise EmpireRouterError(f"Provider {route.provider_id!r} has no base URL configured.", status_code=503)
    return f"{base}/{endpoint.lstrip('/')}"


async def request_chat(payload: dict[str, Any], route: ResolvedRoute) -> dict[str, Any]:
    request_payload = dict(payload)
    request_payload["model"] = route.provider_model
    request_payload["stream"] = False
    timeout = float(os.getenv("EMPIRE_ROUTER_TIMEOUT_SECONDS", "120"))
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(upstream_url(route, "chat/completions"), headers=provider_headers(route), json=request_payload)
    if response.is_error:
        raise EmpireRouterError(f"{route.provider_id} returned HTTP {response.status_code}: {response.text[:800]}")
    try:
        return response.json()
    except ValueError as exc:
        raise EmpireRouterError(f"{route.provider_id} returned invalid JSON") from exc


async def stream_chat(payload: dict[str, Any], route: ResolvedRoute) -> AsyncIterator[dict[str, Any]]:
    request_payload = dict(payload)
    request_payload["model"] = route.provider_model
    request_payload["stream"] = True
    timeout = float(os.getenv("EMPIRE_ROUTER_TIMEOUT_SECONDS", "120"))
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", upstream_url(route, "chat/completions"), headers=provider_headers(route), json=request_payload) as response:
            if response.is_error:
                raw = await response.aread()
                raise EmpireRouterError(f"{route.provider_id} returned HTTP {response.status_code}: {raw.decode(errors='replace')[:800]}")
            async for line in response.aiter_lines():
                line = line.strip()
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                except json.JSONDecodeError:
                    continue
                if isinstance(chunk, dict):
                    yield chunk


def blocks_to_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "".join(str(item.get("text", item.get("content", ""))) if isinstance(item, dict) else str(item) for item in value)
    if isinstance(value, dict):
        return str(value.get("text", value.get("content", value)))
    return str(value)


def anthropic_to_chat(body: dict[str, Any]) -> dict[str, Any]:
    messages: list[dict[str, Any]] = []
    system = body.get("system")
    if system:
        text = blocks_to_text(system)
        if text:
            messages.append({"role": "system", "content": text})
    for incoming in body.get("messages", []):
        if not isinstance(incoming, dict):
            continue
        role, content = incoming.get("role", "user"), incoming.get("content", "")
        if isinstance(content, str):
            messages.append({"role": role, "content": content})
            continue
        if not isinstance(content, list):
            continue
        if role == "assistant":
            text_parts, tool_calls = [], []
            for block in content:
                if not isinstance(block, dict):
                    continue
                if block.get("type") == "text":
                    text_parts.append(str(block.get("text", "")))
                elif block.get("type") == "tool_use":
                    tool_calls.append({"id": str(block.get("id") or f"call_{uuid.uuid4().hex}"), "type": "function", "function": {"name": str(block.get("name", "tool")), "arguments": json.dumps(block.get("input", {}), separators=(",", ":"))}})
            message: dict[str, Any] = {"role": "assistant", "content": "".join(text_parts) or None}
            if tool_calls:
                message["tool_calls"] = tool_calls
            messages.append(message)
            continue
        user_parts, tool_results = [], []
        for block in content:
            if not isinstance(block, dict):
                continue
            kind = block.get("type")
            if kind == "text":
                user_parts.append({"type": "text", "text": str(block.get("text", ""))})
            elif kind == "image":
                source = block.get("source") or {}
                if isinstance(source, dict) and source.get("type") == "base64":
                    user_parts.append({"type": "image_url", "image_url": {"url": f"data:{source.get('media_type', 'image/png')};base64,{source.get('data', '')}"}})
            elif kind == "tool_result":
                tool_results.append({"role": "tool", "tool_call_id": str(block.get("tool_use_id", "")), "content": blocks_to_text(block.get("content", ""))})
        if user_parts:
            if all(part.get("type") == "text" for part in user_parts):
                messages.append({"role": "user", "content": "".join(part.get("text", "") for part in user_parts)})
            else:
                messages.append({"role": "user", "content": user_parts})
        messages.extend(tool_results)
    payload: dict[str, Any] = {"model": body.get("model", ""), "messages": messages, "max_tokens": body.get("max_tokens", 4096), "stream": bool(body.get("stream", False))}
    for key in ("temperature", "top_p"):
        if key in body:
            payload[key] = body[key]
    if body.get("stop_sequences"):
        payload["stop"] = body["stop_sequences"]
    if isinstance(body.get("tools"), list):
        payload["tools"] = [{"type": "function", "function": {"name": str(tool.get("name", "tool")), "description": str(tool.get("description", "")), "parameters": tool.get("input_schema") or {"type": "object", "properties": {}}}} for tool in body["tools"] if isinstance(tool, dict)]
    choice = body.get("tool_choice")
    if isinstance(choice, dict):
        if choice.get("type") == "tool" and choice.get("name"):
            payload["tool_choice"] = {"type": "function", "function": {"name": choice["name"]}}
        elif choice.get("type") == "any":
            payload["tool_choice"] = "required"
        elif choice.get("type") == "auto":
            payload["tool_choice"] = "auto"
    return payload


def chat_to_anthropic(chat: dict[str, Any], route: ResolvedRoute) -> dict[str, Any]:
    choices = chat.get("choices") or []
    choice = choices[0] if choices else {}
    message = choice.get("message") or {}
    content: list[dict[str, Any]] = []
    if message.get("content"):
        content.append({"type": "text", "text": message["content"]})
    for tool_call in message.get("tool_calls") or []:
        function = tool_call.get("function") or {}
        raw_args = function.get("arguments") or "{}"
        try:
            parsed_args = json.loads(raw_args)
        except (TypeError, json.JSONDecodeError):
            parsed_args = {"raw": str(raw_args)}
        content.append({"type": "tool_use", "id": tool_call.get("id") or f"toolu_{uuid.uuid4().hex}", "name": function.get("name", "tool"), "input": parsed_args})
    usage = chat.get("usage") or {}
    finish = choice.get("finish_reason")
    stop_reason = "tool_use" if message.get("tool_calls") else ("max_tokens" if finish == "length" else "end_turn")
    return {"id": chat.get("id") or f"msg_{uuid.uuid4().hex}", "type": "message", "role": "assistant", "model": route.requested_model or route.ref, "content": content, "stop_reason": stop_reason, "stop_sequence": None, "usage": {"input_tokens": usage.get("prompt_tokens", 0), "output_tokens": usage.get("completion_tokens", 0)}}


def responses_to_chat(body: dict[str, Any]) -> dict[str, Any]:
    messages: list[dict[str, Any]] = []
    if body.get("instructions"):
        messages.append({"role": "system", "content": str(body["instructions"])})
    incoming = body.get("input", "")
    if isinstance(incoming, str):
        messages.append({"role": "user", "content": incoming})
    elif isinstance(incoming, list):
        for item in incoming:
            if not isinstance(item, dict):
                continue
            kind = item.get("type")
            if kind == "function_call_output":
                messages.append({"role": "tool", "tool_call_id": str(item.get("call_id", "")), "content": blocks_to_text(item.get("output", ""))})
            elif kind == "function_call":
                messages.append({"role": "assistant", "content": None, "tool_calls": [{"id": item.get("call_id") or item.get("id") or f"call_{uuid.uuid4().hex}", "type": "function", "function": {"name": item.get("name", "tool"), "arguments": item.get("arguments", "{}")}}]})
            else:
                role, content = item.get("role", "user"), item.get("content", "")
                if isinstance(content, list):
                    text = "".join(str(part.get("text", "")) for part in content if isinstance(part, dict) and part.get("type") in {"input_text", "output_text", "text"})
                else:
                    text = str(content)
                messages.append({"role": role, "content": text})
    payload: dict[str, Any] = {"model": body.get("model", ""), "messages": messages, "stream": bool(body.get("stream", False))}
    if body.get("max_output_tokens") is not None:
        payload["max_tokens"] = body["max_output_tokens"]
    if body.get("temperature") is not None:
        payload["temperature"] = body["temperature"]
    tools = body.get("tools")
    if isinstance(tools, list):
        converted = [{"type": "function", "function": {"name": tool.get("name", "tool"), "description": tool.get("description", ""), "parameters": tool.get("parameters") or {"type": "object", "properties": {}}}} for tool in tools if isinstance(tool, dict) and tool.get("type") == "function"]
        if converted:
            payload["tools"] = converted
    return payload


def chat_to_responses(chat: dict[str, Any], route: ResolvedRoute) -> dict[str, Any]:
    choices = chat.get("choices") or []
    message = (choices[0] if choices else {}).get("message") or {}
    output: list[dict[str, Any]] = []
    if message.get("content"):
        output.append({"id": f"msg_{uuid.uuid4().hex}", "type": "message", "role": "assistant", "status": "completed", "content": [{"type": "output_text", "text": message["content"], "annotations": []}]})
    for tool_call in message.get("tool_calls") or []:
        function = tool_call.get("function") or {}
        output.append({"id": f"fc_{uuid.uuid4().hex}", "type": "function_call", "status": "completed", "call_id": tool_call.get("id") or f"call_{uuid.uuid4().hex}", "name": function.get("name", "tool"), "arguments": function.get("arguments", "{}")})
    usage = chat.get("usage") or {}
    return {"id": f"resp_{uuid.uuid4().hex}", "object": "response", "created_at": int(time.time()), "status": "completed", "model": route.requested_model or route.ref, "output": output, "usage": {"input_tokens": usage.get("prompt_tokens", 0), "output_tokens": usage.get("completion_tokens", 0), "total_tokens": usage.get("total_tokens", 0)}}


def sse(event: str, payload: dict[str, Any]) -> bytes:
    return f"event: {event}\ndata: {json.dumps(payload, separators=(',', ':'))}\n\n".encode()


async def anthropic_stream(body: dict[str, Any], route: ResolvedRoute) -> AsyncIterator[bytes]:
    payload = anthropic_to_chat(body)
    payload["stream"] = True
    yield sse("message_start", {"type": "message_start", "message": {"id": f"msg_{uuid.uuid4().hex}", "type": "message", "role": "assistant", "model": route.requested_model or route.ref, "content": [], "stop_reason": None, "stop_sequence": None, "usage": {"input_tokens": 0, "output_tokens": 0}}})
    text_started = False
    text_index = 0
    next_index = 0
    tool_indexes: dict[int, int] = {}
    finish_reason = None
    async for chunk in stream_chat(payload, route):
        choices = chunk.get("choices") or []
        if not choices:
            continue
        choice = choices[0]
        finish_reason = choice.get("finish_reason") or finish_reason
        delta = choice.get("delta") or {}
        text = delta.get("content")
        if text:
            if not text_started:
                text_index = next_index
                next_index += 1
                text_started = True
                yield sse("content_block_start", {"type": "content_block_start", "index": text_index, "content_block": {"type": "text", "text": ""}})
            yield sse("content_block_delta", {"type": "content_block_delta", "index": text_index, "delta": {"type": "text_delta", "text": text}})
        for call in delta.get("tool_calls") or []:
            upstream_index = int(call.get("index", 0))
            function = call.get("function") or {}
            if upstream_index not in tool_indexes:
                tool_indexes[upstream_index] = next_index
                next_index += 1
                yield sse("content_block_start", {"type": "content_block_start", "index": tool_indexes[upstream_index], "content_block": {"type": "tool_use", "id": call.get("id") or f"toolu_{uuid.uuid4().hex}", "name": function.get("name", "tool"), "input": {}}})
            if function.get("arguments"):
                yield sse("content_block_delta", {"type": "content_block_delta", "index": tool_indexes[upstream_index], "delta": {"type": "input_json_delta", "partial_json": function["arguments"]}})
    if text_started:
        yield sse("content_block_stop", {"type": "content_block_stop", "index": text_index})
    for upstream_index in sorted(tool_indexes):
        yield sse("content_block_stop", {"type": "content_block_stop", "index": tool_indexes[upstream_index]})
    stop_reason = "tool_use" if tool_indexes else ("max_tokens" if finish_reason == "length" else "end_turn")
    yield sse("message_delta", {"type": "message_delta", "delta": {"stop_reason": stop_reason, "stop_sequence": None}, "usage": {"output_tokens": 0}})
    yield sse("message_stop", {"type": "message_stop"})


async def responses_stream(body: dict[str, Any], route: ResolvedRoute) -> AsyncIterator[bytes]:
    payload = responses_to_chat(body)
    payload["stream"] = True
    response_id = f"resp_{uuid.uuid4().hex}"
    response = {"id": response_id, "object": "response", "created_at": int(time.time()), "status": "in_progress", "model": route.requested_model or route.ref, "output": []}
    yield sse("response.created", {"type": "response.created", "response": response})
    text_item_id = f"msg_{uuid.uuid4().hex}"
    text_started = False
    text_output_index = 0
    full_text = ""
    tool_state: dict[int, dict[str, Any]] = {}
    output_index = 0
    async for chunk in stream_chat(payload, route):
        choices = chunk.get("choices") or []
        if not choices:
            continue
        delta = choices[0].get("delta") or {}
        text = delta.get("content")
        if text:
            if not text_started:
                text_output_index = output_index
                output_index += 1
                text_started = True
                item = {"id": text_item_id, "type": "message", "role": "assistant", "status": "in_progress", "content": []}
                yield sse("response.output_item.added", {"type": "response.output_item.added", "output_index": text_output_index, "item": item})
                yield sse("response.content_part.added", {"type": "response.content_part.added", "item_id": text_item_id, "output_index": text_output_index, "content_index": 0, "part": {"type": "output_text", "text": "", "annotations": []}})
            full_text += text
            yield sse("response.output_text.delta", {"type": "response.output_text.delta", "item_id": text_item_id, "output_index": text_output_index, "content_index": 0, "delta": text})
        for call in delta.get("tool_calls") or []:
            idx = int(call.get("index", 0))
            function = call.get("function") or {}
            state = tool_state.get(idx)
            if state is None:
                state = {"id": f"fc_{uuid.uuid4().hex}", "call_id": call.get("id") or f"call_{uuid.uuid4().hex}", "name": function.get("name", "tool"), "arguments": "", "output_index": output_index}
                tool_state[idx] = state
                output_index += 1
                item = {"id": state["id"], "type": "function_call", "status": "in_progress", "call_id": state["call_id"], "name": state["name"], "arguments": ""}
                yield sse("response.output_item.added", {"type": "response.output_item.added", "output_index": state["output_index"], "item": item})
            args = function.get("arguments") or ""
            if args:
                state["arguments"] += args
                yield sse("response.function_call_arguments.delta", {"type": "response.function_call_arguments.delta", "item_id": state["id"], "output_index": state["output_index"], "delta": args})
    completed_output: list[dict[str, Any]] = []
    if text_started:
        yield sse("response.output_text.done", {"type": "response.output_text.done", "item_id": text_item_id, "output_index": text_output_index, "content_index": 0, "text": full_text})
        yield sse("response.content_part.done", {"type": "response.content_part.done", "item_id": text_item_id, "output_index": text_output_index, "content_index": 0, "part": {"type": "output_text", "text": full_text, "annotations": []}})
        item = {"id": text_item_id, "type": "message", "role": "assistant", "status": "completed", "content": [{"type": "output_text", "text": full_text, "annotations": []}]}
        completed_output.append(item)
        yield sse("response.output_item.done", {"type": "response.output_item.done", "output_index": text_output_index, "item": item})
    for idx in sorted(tool_state):
        state = tool_state[idx]
        yield sse("response.function_call_arguments.done", {"type": "response.function_call_arguments.done", "item_id": state["id"], "output_index": state["output_index"], "arguments": state["arguments"]})
        item = {"id": state["id"], "type": "function_call", "status": "completed", "call_id": state["call_id"], "name": state["name"], "arguments": state["arguments"]}
        completed_output.append(item)
        yield sse("response.output_item.done", {"type": "response.output_item.done", "output_index": state["output_index"], "item": item})
    response["status"] = "completed"
    response["output"] = completed_output
    yield sse("response.completed", {"type": "response.completed", "response": response})
