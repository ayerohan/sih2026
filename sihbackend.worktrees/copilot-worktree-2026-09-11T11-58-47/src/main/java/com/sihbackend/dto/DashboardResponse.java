package com.sihbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {
	private Long projectId;
	private String projectName;
	private BigDecimal overallProgress;
	private long completedActivities;
	private long inProgressActivities;
	private long delayedActivities;
	private long pendingReviews;
	private List<DisciplineProgress> disciplineProgress;

	public DashboardResponse() {
	}

	public DashboardResponse(Long projectId, String projectName, BigDecimal overallProgress,
							 long completedActivities, long inProgressActivities, long delayedActivities,
							 long pendingReviews, List<DisciplineProgress> disciplineProgress) {
		this.projectId = projectId;
		this.projectName = projectName;
		this.overallProgress = overallProgress;
		this.completedActivities = completedActivities;
		this.inProgressActivities = inProgressActivities;
		this.delayedActivities = delayedActivities;
		this.pendingReviews = pendingReviews;
		this.disciplineProgress = disciplineProgress;
	}

	public Long getProjectId() { return projectId; }
	public String getProjectName() { return projectName; }
	public BigDecimal getOverallProgress() { return overallProgress; }
	public long getCompletedActivities() { return completedActivities; }
	public long getInProgressActivities() { return inProgressActivities; }
	public long getDelayedActivities() { return delayedActivities; }
	public long getPendingReviews() { return pendingReviews; }
	public List<DisciplineProgress> getDisciplineProgress() { return disciplineProgress; }
}
