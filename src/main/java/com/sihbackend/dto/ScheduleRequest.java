package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;

public record ScheduleRequest(@NotBlank String name, String sourceType, Integer version, Long uploadedBy,
                              String status) {
}
