package com.sihbackend.dto;

import com.sihbackend.enums.MatchStatus;
import java.math.BigDecimal;

public record ActivityMatchResponse(Long id, Long scheduleActivityId, String activityCode,
									String activityName, BigDecimal matchScore, MatchStatus status) {
}
