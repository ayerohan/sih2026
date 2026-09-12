package com.sihbackend.service;

import com.sihbackend.enums.ActivityStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExtractedEventData(String activityDescription, String discipline, String location,
                                 LocalDate eventDate, ActivityStatus status, BigDecimal progressPercentage,
                                 BigDecimal confidence, String extractedData) {
}
