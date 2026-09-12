package com.sihbackend.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ReviewResponse {
	private Long id;
	private Long activityMatchId;
	private Long reviewerId;
	private String decision;
	private String comment;
	private OffsetDateTime reviewedAt;

	public ReviewResponse() { }

	public ReviewResponse(Long id, Long activityMatchId, Long reviewerId, String decision, String comment,
			OffsetDateTime reviewedAt) {
		this.id = id; this.activityMatchId = activityMatchId; this.reviewerId = reviewerId;
		this.decision = decision; this.comment = comment; this.reviewedAt = reviewedAt;
	}
}