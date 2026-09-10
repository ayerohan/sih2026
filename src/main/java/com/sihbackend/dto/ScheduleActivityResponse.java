package com.sihbackend.dto;

import com.sihbackend.enums.ActivityLevel;
import com.sihbackend.enums.ActivityStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ScheduleActivityResponse(Long id, Long scheduleId, String activityCode, String activityName,
                                       ActivityLevel level, Long parentActivityId, String discipline, String location,
                                       LocalDate plannedStart, LocalDate plannedFinish, BigDecimal plannedProgress,
                                       LocalDate actualStart, LocalDate actualFinish, BigDecimal actualProgress,
                                       ActivityStatus status) {
}
