package com.sihbackend.service;

import com.sihbackend.dto.DashboardResponse;
import com.sihbackend.entity.ScheduleActivity;
import com.sihbackend.repository.ReviewRepository;
import com.sihbackend.repository.ScheduleActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final ScheduleActivityRepository activityRepository;
    private final ReviewRepository reviewRepository;
    public DashboardService(ScheduleActivityRepository activityRepository, ReviewRepository reviewRepository) { this.activityRepository = activityRepository; this.reviewRepository = reviewRepository; }
    @Transactional(readOnly = true) public DashboardResponse getProjectDashboard(Long projectId) {
        List<ScheduleActivity> activities = activityRepository.findByScheduleProjectId(projectId);
        BigDecimal overall = average(activities.stream().map(ScheduleActivity::getActualProgress).toList());
        long completed = activities.stream().filter(a -> a.getStatus() == com.sihbackend.enums.ActivityStatus.COMPLETED).count();
        long inProgress = activities.stream().filter(a -> a.getStatus() == com.sihbackend.enums.ActivityStatus.IN_PROGRESS).count();
        long delayed = activities.stream().filter(a -> a.getStatus() == com.sihbackend.enums.ActivityStatus.DELAYED).count();
        List<DashboardResponse.DisciplineProgress> discipline = activities.stream().collect(Collectors.groupingBy(a -> a.getDiscipline() == null ? "UNSPECIFIED" : a.getDiscipline())).entrySet().stream().map(this::discipline).toList();
        long pending = reviewRepository.findByActivityMatchExtractedEventProgressReportProjectId(projectId).stream().filter(r -> "PENDING".equals(r.getDecision())).count();
        return new DashboardResponse(overall, completed, inProgress, delayed, pending, discipline);
    }
    private DashboardResponse.DisciplineProgress discipline(Map.Entry<String, List<ScheduleActivity>> entry) {
        List<ScheduleActivity> values = entry.getValue();
        return new DashboardResponse.DisciplineProgress(entry.getKey(), average(values.stream().map(ScheduleActivity::getPlannedProgress).toList()), average(values.stream().map(ScheduleActivity::getActualProgress).toList()));
    }
    private BigDecimal average(List<BigDecimal> values) { List<BigDecimal> present = values.stream().filter(java.util.Objects::nonNull).toList(); return present.isEmpty() ? BigDecimal.ZERO : present.stream().reduce(BigDecimal.ZERO, BigDecimal::add).divide(BigDecimal.valueOf(present.size()), 2, java.math.RoundingMode.HALF_UP); }
}
