from datetime import date
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ScheduleActivity(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    activity_code: str = Field(alias="activityCode")
    activity_name: str = Field(alias="activityName")
    discipline: str | None = None
    location: str | None = None
    planned_start: date | None = Field(default=None, alias="plannedStart")
    planned_finish: date | None = Field(default=None, alias="plannedFinish")


class ProcessRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    report: str = Field(min_length=1)
    report_date: date = Field(alias="reportDate")
    schedule_activities: list[ScheduleActivity] = Field(alias="scheduleActivities")


class ExtractedEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    activity_description: str = Field(alias="activityDescription")
    discipline: str | None = None
    location: str | None = None
    status: str | None = None
    progress_percentage: float | None = Field(default=None, alias="progressPercentage")
    event_date: date | None = Field(default=None, alias="eventDate")
    extraction_confidence: float = Field(alias="extractionConfidence", ge=0, le=1)
    matched_activity_id: int | None = Field(default=None, alias="matchedActivityId")
    match_confidence: float | None = Field(default=None, alias="matchConfidence", ge=0, le=1)

    @field_validator("progress_percentage")
    @classmethod
    def validate_progress(cls, value: float | None) -> float | None:
        if value is not None and not 0 <= value <= 100:
            raise ValueError("progressPercentage must be between 0 and 100")
        return value


class ProcessResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    events: list[ExtractedEvent]
    processing_status: str = Field(alias="processingStatus")
    model: str


class HealthResponse(BaseModel):
    status: str
    service: str


class LLMEvents(BaseModel):
    events: list[ExtractedEvent]


JsonObject = dict[str, Any]
