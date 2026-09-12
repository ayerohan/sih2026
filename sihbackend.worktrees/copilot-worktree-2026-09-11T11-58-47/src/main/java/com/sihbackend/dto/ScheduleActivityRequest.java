package com.sihbackend.dto;

import com.sihbackend.enums.ActivityLevel;
import com.sihbackend.enums.ActivityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;


@Data
public class ScheduleActivityRequest {
	@NotBlank
	private String activityCode;
	@NotBlank
	private String activityName;
	@NotNull
	private ActivityLevel level;
	private Long parentActivityId;
	private String discipline;
	private String location;
	private LocalDate plannedStart;
	private LocalDate plannedFinish;
	private BigDecimal plannedProgress;
	private ActivityStatus status;

	public String getActivityCode() { return activityCode; }
	public void setActivityCode(String activityCode) { this.activityCode = activityCode; }
	public String getActivityName() { return activityName; }
	public void setActivityName(String activityName) { this.activityName = activityName; }
	public ActivityLevel getLevel() { return level; }
	public void setLevel(ActivityLevel level) { this.level = level; }
	public Long getParentActivityId() { return parentActivityId; }
	public void setParentActivityId(Long parentActivityId) { this.parentActivityId = parentActivityId; }
	public String getDiscipline() { return discipline; }
	public void setDiscipline(String discipline) { this.discipline = discipline; }
	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }
	public LocalDate getPlannedStart() { return plannedStart; }
	public void setPlannedStart(LocalDate plannedStart) { this.plannedStart = plannedStart; }
	public LocalDate getPlannedFinish() { return plannedFinish; }
	public void setPlannedFinish(LocalDate plannedFinish) { this.plannedFinish = plannedFinish; }
	public BigDecimal getPlannedProgress() { return plannedProgress; }
	public void setPlannedProgress(BigDecimal plannedProgress) { this.plannedProgress = plannedProgress; }
	public ActivityStatus getStatus() { return status; }
	public void setStatus(ActivityStatus status) { this.status = status; }
}
