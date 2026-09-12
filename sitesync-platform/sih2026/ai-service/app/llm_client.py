import json
from typing import Any

from openai import APIError, AsyncOpenAI, OpenAIError

from .config import Settings


class LLMClientError(RuntimeError):
    pass


class LLMClient:
    def __init__(self, settings: Settings) -> None:
        if not settings.openrouter_api_key:
            raise LLMClientError("OPENROUTER_API_KEY is not configured")
        self.model = settings.ai_model
        self.client = AsyncOpenAI(
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url,
            default_headers={
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": settings.ai_service_name,
            },
        )

    async def analyze(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                temperature=0,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
        except (APIError, OpenAIError) as exc:
            raise LLMClientError("The AI provider request failed") from exc

        content = response.choices[0].message.content if response.choices else None
        if not content:
            raise LLMClientError("The AI provider returned an empty response")

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise LLMClientError("The AI provider returned invalid JSON") from exc

        if not isinstance(parsed, dict):
            raise LLMClientError("The AI provider returned an invalid JSON object")
        return parsed
