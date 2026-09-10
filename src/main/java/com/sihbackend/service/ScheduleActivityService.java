package com.sihbackend.service;

import com.sihbackend.dto.ScheduleActivityRequest;
import com.sihbackend.dto.ScheduleActivityResponse;
import com.sihbackend.entity.ScheduleActivity;
import com.sihbackend.enums.ActivityLevel;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ScheduleActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ScheduleActivityService {
	private final ScheduleActivityRepository repository;
	private final ScheduleService scheduleService;
	public ScheduleActivityService(ScheduleActivityRepository repository, ScheduleService scheduleService) { this.repository = repository; this.scheduleService = scheduleService; }
	@Transactional(readOnly = true) public List<ScheduleActivityResponse> findBySchedule(Long scheduleId) { return repository.findByScheduleId(scheduleId).stream().map(this::toResponse).toList(); }
	@Transactional(readOnly = true) public List<ScheduleActivityResponse> findByLevel(Long scheduleId, ActivityLevel level) { return repository.findByScheduleId(scheduleId).stream().filter(a -> a.getLevel() == level).map(this::toResponse).toList(); }
	@Transactional(readOnly = true) public ScheduleActivityResponse findById(Long id) { return toResponse(get(id)); }
	@Transactional(readOnly = true) public List<ScheduleActivityResponse> findChildren(Long id) { return repository.findByParentActivityId(id).stream().map(this::toResponse).toList(); }
	@Transactional public ScheduleActivityResponse create(Long scheduleId, ScheduleActivityRequest request) {
		ScheduleActivity activity = new ScheduleActivity(); activity.setSchedule(scheduleService.get(scheduleId));
		activity.setActivityCode(request.activityCode()); activity.setActivityName(request.activityName()); activity.setLevel(request.level());
		activity.setParentActivity(request.parentActivityId() == null ? null : get(request.parentActivityId())); activity.setDiscipline(request.discipline());
		activity.setLocation(request.location()); activity.setPlannedStart(request.plannedStart()); activity.setPlannedFinish(request.plannedFinish());
		activity.setPlannedProgress(request.plannedProgress()); activity.setActualProgress(java.math.BigDecimal.ZERO);
		activity.setStatus(com.sihbackend.enums.ActivityStatus.NOT_STARTED); return toResponse(repository.save(activity));
	}
	public ScheduleActivity get(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Schedule activity", id)); }
	private ScheduleActivityResponse toResponse(ScheduleActivity a) { return new ScheduleActivityResponse(a.getId(), a.getSchedule().getId(), a.getActivityCode(), a.getActivityName(), a.getLevel(), a.getParentActivity() == null ? null : a.getParentActivity().getId(), a.getDiscipline(), a.getLocation(), a.getPlannedStart(), a.getPlannedFinish(), a.getPlannedProgress(), a.getActualStart(), a.getActualFinish(), a.getActualProgress(), a.getStatus()); }
}
