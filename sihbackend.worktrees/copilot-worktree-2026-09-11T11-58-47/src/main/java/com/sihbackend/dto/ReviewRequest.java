package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewRequest {
	@NotBlank
	private String decision;
	private String comment;
	private Long selectedActivityId;

	public String getDecision() { return decision; }
	public void setDecision(String decision) { this.decision = decision; }
	public String getComment() { return comment; }
	public void setComment(String comment) { this.comment = comment; }
	public Long getSelectedActivityId() { return selectedActivityId; }
	public void setSelectedActivityId(Long selectedActivityId) { this.selectedActivityId = selectedActivityId; }
}
