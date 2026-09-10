package com.sihbackend.dto;

import java.time.OffsetDateTime;

public record ReviewResponse(Long id, Long matchId, Long projectId, String decision, String comment,
                             Long reviewerId, OffsetDateTime reviewedAt, ActivityMatchResponse match) {
}
