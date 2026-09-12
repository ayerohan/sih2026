package com.sihbackend.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ScheduleResponse {
	private Long id;
	private Long projectId;
	private String name;
	private String sourceType;
	private Integer version;
	private Long uploadedBy;
	private OffsetDateTime uploadedAt;
	private String status;

	public ScheduleResponse() { }

	public ScheduleResponse(Long id, Long projectId, String name, String sourceType, Integer version,
			Long uploadedBy, OffsetDateTime uploadedAt, String status) {
		this.id = id;
		this.projectId = projectId;
		this.name = name;
		this.sourceType = sourceType;
		this.version = version;
		this.uploadedBy = uploadedBy;
		this.uploadedAt = uploadedAt;
		this.status = status;
	}
}