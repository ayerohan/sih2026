package com.sihbackend.dto;

import java.time.OffsetDateTime;

public record ProjectMemberResponse(Long id, Long projectId, Long userId, String userName,
									String role, OffsetDateTime joinedAt) {
}