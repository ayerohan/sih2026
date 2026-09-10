package com.sihbackend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ProjectResponse(Long id, String name, String projectCode, String description, String location,
                              LocalDate startDate, LocalDate plannedEndDate, String status,
                              OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
