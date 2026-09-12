package com.sihbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "schedules", indexes = @Index(name = "idx_schedule_project", columnList = "project_id"))
@Getter @Setter @NoArgsConstructor
public class Schedule {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id") private Project project;
	@Column(nullable = false) private String name;
	private String sourceType;
	private Integer version;
	private Long uploadedBy;
	private OffsetDateTime uploadedAt;
	private String status;
}
