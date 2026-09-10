package com.sihbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(BigDecimal overallProgress, long completedActivities,
								long inProgressActivities, long delayedActivities, long pendingReviews,
								List<DisciplineProgress> disciplineProgress) {
	public record DisciplineProgress(String discipline, BigDecimal planned, BigDecimal actual) { }
}
