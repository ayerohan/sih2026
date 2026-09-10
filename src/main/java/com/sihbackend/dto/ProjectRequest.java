package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record ProjectRequest(@NotBlank String name, @NotBlank String projectCode, String description,
							 String location, LocalDate startDate, LocalDate plannedEndDate) {
}
