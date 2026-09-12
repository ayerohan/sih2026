package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {
	@NotBlank
	private String name;
	@NotBlank
	private String projectCode;
	private String description;
	private String location;
	@NotNull
	private LocalDate startDate;
	@NotNull
	private LocalDate plannedEndDate;
	private String status;

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getProjectCode() { return projectCode; }
	public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }
	public LocalDate getStartDate() { return startDate; }
	public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
	public LocalDate getPlannedEndDate() { return plannedEndDate; }
	public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }
}
