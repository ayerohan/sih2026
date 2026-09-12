package com.sihbackend.dto;

import com.sihbackend.enums.ProcessingStatus;

import java.util.List;

public record ProgressReportResponse(Long reportId, ProcessingStatus processingStatus,
                                     ExtractedEventResponse extractedEvent,
                                     List<ActivityMatchResponse> matches, boolean autoLinked) {
}
