package com.sihbackend.service;

import com.sihbackend.dto.DashboardResponse;
import com.sihbackend.dto.DisciplineProgress;
import com.sihbackend.entity.Project;
import com.sihbackend.entity.ScheduleActivity;
import com.sihbackend.enums.ActivityStatus;
import com.sihbackend.enums.MatchStatus;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ActivityMatchRepository;
import com.sihbackend.repository.ProjectRepository;
import com.sihbackend.repository.ScheduleActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class DashboardService {
	private final ProjectRepository projectRepository;
	private final ScheduleActivityRepository activityRepository;
	private final ActivityMatchRepository matchRepository;

	public DashboardService(ProjectRepository projectRepository,
			ScheduleActivityRepository activityRepository, ActivityMatchRepository matchRepository) {
		this.projectRepository = projectRepository;
		this.activityRepository = activityRepository;
		this.matchRepository = matchRepository;
	}

	@Transactional(readOnly = true)
	public DashboardResponse get(Long projectId) {
		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
		List<ScheduleActivity> activities = activityRepository.findByScheduleProjectId(projectId);
		BigDecimal overallProgress = average(activities.stream().map(ScheduleActivity::getActualProgress).toList());
		long completed = countByStatus(activities, ActivityStatus.COMPLETED);
		long inProgress = countByStatus(activities, ActivityStatus.IN_PROGRESS);
		long delayed = countByStatus(activities, ActivityStatus.DELAYED);
		long pendingReviews = matchRepository.findByStatus(MatchStatus.PENDING_REVIEW).stream()
				.filter(match -> match.getExtractedEvent().getProgressReport().getProject().getId().equals(projectId))
				.count();
		List<DisciplineProgress> disciplineProgress = activities.stream()
				.filter(activity -> activity.getDiscipline() != null)
				.collect(Collectors.groupingBy(ScheduleActivity::getDiscipline))
				.entrySet().stream()
				.map(entry -> new DisciplineProgress(entry.getKey(),
						average(entry.getValue().stream().map(ScheduleActivity::getPlannedProgress).toList()),
						average(entry.getValue().stream().map(ScheduleActivity::getActualProgress).toList())))
				.toList();
		return new DashboardResponse(project.getId(), project.getName(), overallProgress, completed,
				inProgress, delayed, pendingReviews, disciplineProgress);
	}

	private long countByStatus(List<ScheduleActivity> activities, ActivityStatus status) {
		return activities.stream().filter(activity -> activity.getStatus() == status).count();
	}

	private BigDecimal average(List<BigDecimal> values) {
		List<BigDecimal> present = values.stream().filter(Objects::nonNull).toList();
		if (present.isEmpty()) {
			return BigDecimal.ZERO;
		}
		return present.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
				.divide(BigDecimal.valueOf(present.size()), 2, java.math.RoundingMode.HALF_UP);
	}
}
