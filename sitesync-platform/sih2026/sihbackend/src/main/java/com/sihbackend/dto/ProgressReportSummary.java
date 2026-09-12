package com.sihbackend.dto;

import com.sihbackend.enums.ProcessingStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ProgressReportSummary(Long id, Long projectId, String title, String rawText,
                                    LocalDate reportDate, OffsetDateTime submittedAt,
                                    ProcessingStatus processingStatus) {
}
