package com.sihbackend.dto;

import com.sihbackend.enums.ProcessingStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class ProgressReportResponse {
    private Long id;
    private Long projectId;
    private Long submittedBy;
    private String title;
    private String rawText;
    private LocalDate reportDate;
    private OffsetDateTime submittedAt;
    private String reportType;
    private String sourceDocumentId;
    private ProcessingStatus processingStatus;
    private ExtractedEventResponse extractedEvent;
    private List<ActivityMatchResponse> matches;
    private boolean autoLinked;

    public ProgressReportResponse() { }

    public ProgressReportResponse(Long id, Long projectId, Long submittedBy, String title, String rawText,
            LocalDate reportDate, OffsetDateTime submittedAt, String reportType, String sourceDocumentId,
            ProcessingStatus processingStatus, ExtractedEventResponse extractedEvent,
            List<ActivityMatchResponse> matches, boolean autoLinked) {
        this.id = id; this.projectId = projectId; this.submittedBy = submittedBy; this.title = title;
        this.rawText = rawText; this.reportDate = reportDate; this.submittedAt = submittedAt;
        this.reportType = reportType; this.sourceDocumentId = sourceDocumentId;
        this.processingStatus = processingStatus; this.extractedEvent = extractedEvent;
        this.matches = matches; this.autoLinked = autoLinked;
    }
}
