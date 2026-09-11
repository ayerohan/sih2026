from .extraction import extract_events
from .llm_client import LLMClient
from .matching import validate_matches
from .ai_matcher import get_matcher
from .schemas import ProcessRequest, ProcessResponse


async def process_report(
    request: ProcessRequest,
    client: LLMClient,
) -> ProcessResponse:

    # Step 1: Extract events from the field report using the LLM
    events = await extract_events(request, client)

    # Step 2: Use the AI semantic matcher to map each event
    # to the most relevant planned schedule activity.
    matcher = get_matcher()

    for event in events:
        result = matcher.match(
            event,
            request.schedule_activities,
        )

        event.matched_activity_id = result["matched_activity_id"]
        event.match_confidence = result["match_confidence"]

    # Step 3: Validate that the selected activity IDs
    # actually exist in the supplied schedule.
    validated_events = validate_matches(
        events,
        request.schedule_activities,
    )

    return ProcessResponse(
        events=validated_events,
        processingStatus="PROCESSED",
        model=client.model,
    )