from app.services.empire_router_service import anthropic_to_chat, resolve_route, responses_to_chat


def test_direct_local_route():
    route = resolve_route("ollama/qwen-test")
    assert route.provider_id == "ollama"
    assert route.provider_model == "qwen-test"


def test_default_route_uses_configured_provider(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test")
    monkeypatch.setenv("EMPIRE_ROUTER_MODEL", "open_router/openrouter/free")
    route = resolve_route("claude-sonnet")
    assert route.ref == "open_router/openrouter/free"


def test_anthropic_tool_schema_converts_to_openai():
    payload = anthropic_to_chat({
        "model": "claude-sonnet",
        "max_tokens": 100,
        "messages": [{"role": "user", "content": [{"type": "text", "text": "hi"}]}],
        "tools": [{"name": "read_file", "description": "read", "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}}}],
    })
    assert payload["messages"][-1]["content"] == "hi"
    assert payload["tools"][0]["function"]["name"] == "read_file"


def test_responses_function_output_converts_to_tool_message():
    payload = responses_to_chat({
        "model": "open_router/openrouter/free",
        "input": [{"type": "function_call_output", "call_id": "call_1", "output": "done"}],
    })
    assert payload["messages"][0] == {"role": "tool", "tool_call_id": "call_1", "content": "done"}
