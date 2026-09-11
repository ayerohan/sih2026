package com.sihbackend.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class AuditLogResponse {
	private Long id;
	private Long projectId;
	private String entityType;
	private Long entityId;
	private String action;
	private String oldValue;
	private String newValue;
	private Long performedBy;
	private OffsetDateTime performedAt;
	private String reason;

	public AuditLogResponse() { }

	public AuditLogResponse(Long id, Long projectId, String entityType, Long entityId, String action,
			String oldValue, String newValue, Long performedBy, OffsetDateTime performedAt, String reason) {
		this.id = id; this.projectId = projectId; this.entityType = entityType; this.entityId = entityId;
		this.action = action; this.oldValue = oldValue; this.newValue = newValue; this.performedBy = performedBy;
		this.performedAt = performedAt; this.reason = reason;
	}
}