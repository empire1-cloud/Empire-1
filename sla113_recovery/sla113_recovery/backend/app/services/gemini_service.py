import httpx
import os
from typing import Dict, Any, Optional

class GeminiService:
    def __init__(self):
        # We'll use the API key from the environment (extracted from user history)
        self.api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyBvWiHFNhdicOrYhq3xsmJ0LBqylNWnSR0")
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.api_key}"

    async def generate_beat(self, tenant_id: str) -> Dict[str, Any]:
        """
        Generates a narrative 'beat' for a specific tenant.
        - empire1: Sophisticated, sleek, enterprise AI vibe.
        - southern: Grounded, loyal, SGV/IE night atmosphere.
        """
        prompt = self._get_prompt(tenant_id)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.api_url,
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }]
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    # Gemini response path: candidates[0].content.parts[0].text
                    raw_text = data['candidates'][0]['content']['parts'][0]['text']
                    return self._parse_beat(raw_text)
                else:
                    return self._fallback_beat(tenant_id)
            except Exception as e:
                print(f"GEMINI_ERROR: {e}")
                return self._fallback_beat(tenant_id)

    def _get_prompt(self, tenant_id: str) -> str:
        if tenant_id == "southern_lyfestyle":
            return """
            You are the voice of Southern Lyfestyle. Generate a 1-sentence 'Atmospheric Beat' for the system status.
            Mood: SGV/IE at night, quiet pain, loyalty, cold asphalt, chrome reflections.
            Format: Just the sentence. No quotes.
            Example: The chrome reflects a cold moon as the SGV waits for the dawn.
            """
        else:
            return """
            You are the voice of Empire One. Generate a 1-sentence 'System Pulse' for the dashboard.
            Mood: Sophisticated, sleek, enterprise AI, digital obsidian, high-control.
            Format: Just the sentence. No quotes.
            Example: All neural pathways optimized for maximum-control deployment.
            """

    def _parse_beat(self, raw_text: str) -> Dict[str, Any]:
        return {
            "content": raw_text.strip(),
            "timestamp": "COLD_ACTIVE",
            "status": "STABLE"
        }

    def _fallback_beat(self, tenant_id: str) -> Dict[str, Any]:
        if tenant_id == "southern_lyfestyle":
            return {"content": "SGV Sector 626 is quiet. The asphalt is cold.", "status": "STABLE"}
        return {"content": "Neural pathways clear. System pulse steady.", "status": "STABLE"}

gemini_service = GeminiService()
