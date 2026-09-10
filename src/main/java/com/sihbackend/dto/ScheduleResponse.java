package com.sihbackend.dto;

import java.time.OffsetDateTime;

public record ScheduleResponse(Long id, Long projectId, String name, String sourceType, Integer version,
                               Long uploadedBy, OffsetDateTime uploadedAt, String status) {
}
