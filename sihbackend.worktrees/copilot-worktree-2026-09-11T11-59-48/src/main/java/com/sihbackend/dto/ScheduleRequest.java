package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScheduleRequest {
	@NotBlank
	private String name;
	@NotBlank
	private String sourceType;
	private Integer version;
	private String status;

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getSourceType() { return sourceType; }
	public void setSourceType(String sourceType) { this.sourceType = sourceType; }
	public Integer getVersion() { return version; }
	public void setVersion(Integer version) { this.version = version; }
	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }
}