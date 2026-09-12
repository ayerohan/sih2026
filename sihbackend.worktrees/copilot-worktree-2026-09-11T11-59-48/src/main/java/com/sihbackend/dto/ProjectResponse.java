package com.sihbackend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class ProjectResponse {
	private Long id;
	private String name;
	private String projectCode;
	private String description;
	private String location;
	private LocalDate startDate;
	private LocalDate plannedEndDate;
	private String status;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	public ProjectResponse() { }

	public ProjectResponse(Long id, String name, String projectCode, String description, String location,
			LocalDate startDate, LocalDate plannedEndDate, String status, OffsetDateTime createdAt,
			OffsetDateTime updatedAt) {
		this.id = id;
		this.name = name;
		this.projectCode = projectCode;
		this.description = description;
		this.location = location;
		this.startDate = startDate;
		this.plannedEndDate = plannedEndDate;
		this.status = status;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
}