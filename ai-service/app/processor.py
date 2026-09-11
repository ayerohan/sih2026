from .extraction import extract_events
from .llm_client import LLMClient
from .matching import validate_matches
from .schemas import ProcessRequest, ProcessResponse


async def process_report(request: ProcessRequest, client: LLMClient) -> ProcessResponse:
    events = await extract_events(request, client)
    validated_events = validate_matches(events, request.schedule_activities)
    return ProcessResponse(
        events=validated_events,
        processingStatus="PROCESSED",
        model=client.model,
    )
