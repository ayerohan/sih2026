package com.sihbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity @Table(name = "audit_logs", indexes = @Index(name = "idx_audit_project", columnList = "project_id"))
@Getter @Setter @NoArgsConstructor
public class AuditLog {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id") private Project project;
	private String entityType;
	private Long entityId;
	@Column(nullable = false) private String action;
	@JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String oldValue;
	@JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String newValue;
	private Long performedBy;
	@Column(nullable = false) private OffsetDateTime performedAt;
	private String reason;
	@PrePersist void onCreate() { performedAt = OffsetDateTime.now(); }
}
