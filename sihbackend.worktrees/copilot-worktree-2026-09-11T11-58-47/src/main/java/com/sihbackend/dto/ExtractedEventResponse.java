package com.sihbackend.dto;

import com.sihbackend.enums.ActivityStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class ExtractedEventResponse {
	private Long id;
	private Long progressReportId;
	private String activityDescription;
	private String discipline;
	private String location;
	private LocalDate eventDate;
	private ActivityStatus status;
	private BigDecimal progressPercentage;
	private String extractedData;
	private BigDecimal extractionConfidence;
	private OffsetDateTime createdAt;

	public ExtractedEventResponse() { }

	public ExtractedEventResponse(Long id, Long progressReportId, String activityDescription, String discipline,
			String location, LocalDate eventDate, ActivityStatus status, BigDecimal progressPercentage,
			String extractedData, BigDecimal extractionConfidence, OffsetDateTime createdAt) {
		this.id = id; this.progressReportId = progressReportId; this.activityDescription = activityDescription;
		this.discipline = discipline; this.location = location; this.eventDate = eventDate; this.status = status;
		this.progressPercentage = progressPercentage; this.extractedData = extractedData;
		this.extractionConfidence = extractionConfidence; this.createdAt = createdAt;
	}
}
