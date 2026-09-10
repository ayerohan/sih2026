package com.sihbackend.dto;

import com.sihbackend.enums.ActivityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ScheduleActivityRequest(@NotBlank String activityCode, @NotBlank String activityName,
									  @NotNull ActivityLevel level, Long parentActivityId, String discipline,
									  String location, LocalDate plannedStart, LocalDate plannedFinish,
									  BigDecimal plannedProgress) {
}
