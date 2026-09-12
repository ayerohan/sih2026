package com.sihbackend.dto;

import com.sihbackend.enums.ActivityLevel;
import com.sihbackend.enums.ActivityStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ScheduleActivityResponse {
	private Long id;
	private Long scheduleId;
	private String activityCode;
	private String activityName;
	private ActivityLevel level;
	private Long parentActivityId;
	private String discipline;
	private String location;
	private LocalDate plannedStart;
	private LocalDate plannedFinish;
	private BigDecimal plannedProgress;
	private LocalDate actualStart;
	private LocalDate actualFinish;
	private BigDecimal actualProgress;
	private ActivityStatus status;

	public ScheduleActivityResponse() { }

	public ScheduleActivityResponse(Long id, Long scheduleId, String activityCode, String activityName,
			ActivityLevel level, Long parentActivityId, String discipline, String location,
			LocalDate plannedStart, LocalDate plannedFinish, BigDecimal plannedProgress,
			LocalDate actualStart, LocalDate actualFinish, BigDecimal actualProgress, ActivityStatus status) {
		this.id = id;
		this.scheduleId = scheduleId;
		this.activityCode = activityCode;
		this.activityName = activityName;
		this.level = level;
		this.parentActivityId = parentActivityId;
		this.discipline = discipline;
		this.location = location;
		this.plannedStart = plannedStart;
		this.plannedFinish = plannedFinish;
		this.plannedProgress = plannedProgress;
		this.actualStart = actualStart;
		this.actualFinish = actualFinish;
		this.actualProgress = actualProgress;
		this.status = status;
	}
}