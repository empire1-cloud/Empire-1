"""Compatibility shim for emergentintegrations-style chat usage."""

import asyncio
import json
import os
from dataclasses import dataclass

import httpx


@dataclass
class UserMessage:
    text: str


class LlmChat:
    def __init__(self, api_key=None, session_id=None, system_message=None):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider = None
        self.model_name = None

    def with_model(self, provider, model_name):
        self.provider = provider
        self.model_name = model_name
        return self

    async def send_message(self, message):
        prompt = self._compose_prompt(message)
        errors = []

        if self.provider == "openai":
            try:
                text = await self._send_openai(prompt)
                if text:
                    return text
            except Exception as exc:
                errors.append(f"openai:{exc}")

        if self.provider == "anthropic":
            try:
                text = await self._send_anthropic(prompt)
                if text:
                    return text
            except Exception as exc:
                errors.append(f"anthropic:{exc}")

        if self.provider == "gemini":
            try:
                text = await self._send_gemini(prompt)
                if text:
                    return text
            except Exception as exc:
                errors.append(f"gemini:{exc}")

        try:
            text = await self._send_vertex(prompt)
            if text:
                return text
        except Exception as exc:
            errors.append(f"vertex:{exc}")

        return json.dumps(
            {
                "summary": "AI provider request failed across configured backends.",
                "steps": [
                    "Verify provider credentials and model access in this runtime.",
                    "Ensure Cloud Run service account has Vertex AI user permissions.",
                ],
                "risks": [
                    "Engine output quality is degraded until at least one provider succeeds."
                ],
                "resources": errors,
                "next_action": "Validate provider auth and rerun the request.",
            }
        )

    def _compose_prompt(self, message):
        user_text = getattr(message, "text", str(message))
        if self.system_message:
            return f"{self.system_message}\n\n{user_text}"
        return user_text

    async def _send_openai(self, prompt):
        key = self.api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            return None

        headers = {
            "Authorization": f"Bearer {key.strip()}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name or "gpt-4o-mini",
            "input": prompt,
        }
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post("https://api.openai.com/v1/responses", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        return data.get("output_text")

    async def _send_anthropic(self, prompt):
        key = self.api_key or os.getenv("ANTHROPIC_API_KEY")
        if not key:
            return None

        headers = {
            "x-api-key": key.strip(),
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self.model_name or "claude-3-5-sonnet-latest",
            "max_tokens": 1500,
            "messages": [{"role": "user", "content": prompt}],
        }
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        parts = data.get("content", [])
        if not parts:
            return None
        return "".join(part.get("text", "") for part in parts if part.get("type") == "text")

    async def _send_gemini(self, prompt):
        key = self.api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not key:
            return None

        model = self.model_name or "gemini-1.5-pro"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        params = {"key": key.strip()}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(url, params=params, json=payload)
            response.raise_for_status()
            data = response.json()

        candidates = data.get("candidates", [])
        if not candidates:
            return None
        parts = candidates[0].get("content", {}).get("parts", [])
        return "".join(part.get("text", "") for part in parts if isinstance(part, dict))

    async def _send_vertex(self, prompt):
        project = os.getenv("VERTEX_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT")
        location = os.getenv("VERTEX_LOCATION", "us-central1")
        if not project:
            return None

        preferred = os.getenv("VERTEX_TEXT_MODEL")
        if not preferred and (self.model_name or "").startswith("gemini-"):
            preferred = self.model_name
        model_candidates = [
            preferred,
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
        ]

        return await asyncio.to_thread(self._vertex_request, project, location, model_candidates, prompt)

    def _vertex_request(self, project, location, model_candidates, prompt):
        import vertexai
        from vertexai.generative_models import GenerativeModel

        vertexai.init(project=project, location=location)

        last_error = None
        for model_name in model_candidates:
            if not model_name:
                continue
            try:
                model = GenerativeModel(model_name)
                response = model.generate_content(prompt)
                text = getattr(response, "text", None)
                if text:
                    return text
            except Exception as exc:
                last_error = exc

        if last_error:
            raise last_error
        return None
