package com.sihbackend.dto;

import com.sihbackend.enums.MatchStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class ActivityMatchResponse {
	private Long id;
	private Long extractedEventId;
	private Long scheduleActivityId;
	private String activityCode;
	private String activityName;
	private BigDecimal matchScore;
	private String matchingMethod;
	private MatchStatus status;
	private OffsetDateTime matchedAt;

	public ActivityMatchResponse() { }

	public ActivityMatchResponse(Long id, Long extractedEventId, Long scheduleActivityId, String activityCode,
			String activityName, BigDecimal matchScore, String matchingMethod, MatchStatus status,
			OffsetDateTime matchedAt) {
		this.id = id; this.extractedEventId = extractedEventId; this.scheduleActivityId = scheduleActivityId;
		this.activityCode = activityCode; this.activityName = activityName; this.matchScore = matchScore;
		this.matchingMethod = matchingMethod; this.status = status; this.matchedAt = matchedAt;
	}
}
