from .schemas import ExtractedEvent, ScheduleActivity


def validate_matches(
    events: list[ExtractedEvent], candidates: list[ScheduleActivity]
) -> list[ExtractedEvent]:
    candidate_ids = {activity.id for activity in candidates}
    validated: list[ExtractedEvent] = []

    for event in events:
        if event.matched_activity_id not in candidate_ids:
            event.matched_activity_id = None
            event.match_confidence = None
        elif event.match_confidence is None:
            event.matched_activity_id = None
        validated.append(event)
    return validated
