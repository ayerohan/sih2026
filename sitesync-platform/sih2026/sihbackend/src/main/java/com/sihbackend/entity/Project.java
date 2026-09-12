package com.sihbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "projects", indexes = @Index(name = "idx_project_code", columnList = "project_code", unique = true))
@Getter @Setter @NoArgsConstructor
public class Project {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false) private String name;
	@Column(name = "project_code", nullable = false, unique = true) private String projectCode;
	private String description;
	private String location;
	private LocalDate startDate;
	private LocalDate plannedEndDate;
	private String status;
	@Column(nullable = false, updatable = false) private OffsetDateTime createdAt;
	@Column(nullable = false) private OffsetDateTime updatedAt;

	@PrePersist void onCreate() { createdAt = updatedAt = OffsetDateTime.now(); }
	@PreUpdate void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
