package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(@NotBlank String decision, String comment, Long reviewerId) {
}
