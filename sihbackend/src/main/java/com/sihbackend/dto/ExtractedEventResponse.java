package com.sihbackend.dto;

import com.sihbackend.enums.ActivityStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExtractedEventResponse(Long id, String activityDescription, String discipline,
									 String location, LocalDate eventDate, ActivityStatus status,
									 BigDecimal progressPercentage, BigDecimal extractionConfidence) {
}
