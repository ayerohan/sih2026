package com.sihbackend.dto;

import com.sihbackend.enums.ActivityStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class ActualProgressResponse {
	private Long id;
	private Long scheduleActivityId;
	private Long extractedEventId;
	private LocalDate actualStart;
	private LocalDate actualFinish;
	private BigDecimal progressPercentage;
	private ActivityStatus status;
	private Long updatedBy;
	private OffsetDateTime updatedAt;

	public ActualProgressResponse() { }

	public ActualProgressResponse(Long id, Long scheduleActivityId, Long extractedEventId, LocalDate actualStart,
			LocalDate actualFinish, BigDecimal progressPercentage, ActivityStatus status, Long updatedBy,
			OffsetDateTime updatedAt) {
		this.id = id; this.scheduleActivityId = scheduleActivityId; this.extractedEventId = extractedEventId;
		this.actualStart = actualStart; this.actualFinish = actualFinish; this.progressPercentage = progressPercentage;
		this.status = status; this.updatedBy = updatedBy; this.updatedAt = updatedAt;
	}
}