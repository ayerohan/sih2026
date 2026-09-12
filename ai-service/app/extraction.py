from .llm_client import LLMClient
from .prompts import SYSTEM_PROMPT, build_user_prompt
from .schemas import ExtractedEvent, LLMEvents, ProcessRequest


async def extract_events(request: ProcessRequest, client: LLMClient) -> list[ExtractedEvent]:
    schedule_payload = [
        activity.model_dump(mode="json", by_alias=True)
        for activity in request.schedule_activities
    ]
    raw_result = await client.analyze(
        SYSTEM_PROMPT,
        build_user_prompt(request.report, request.report_date.isoformat(), schedule_payload),
    )
    return LLMEvents.model_validate(raw_result).events
