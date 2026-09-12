package com.sihbackend.service;

import com.sihbackend.dto.ScheduleActivityRequest;
import com.sihbackend.dto.ScheduleActivityResponse;
import com.sihbackend.entity.Schedule;
import com.sihbackend.entity.ScheduleActivity;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ScheduleActivityRepository;
import com.sihbackend.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ScheduleActivityService {
	private final ScheduleActivityRepository activityRepository;
	private final ScheduleRepository scheduleRepository;

	public ScheduleActivityService(ScheduleActivityRepository activityRepository, ScheduleRepository scheduleRepository) {
		this.activityRepository = activityRepository;
		this.scheduleRepository = scheduleRepository;
	}

	@Transactional
	public ScheduleActivityResponse create(Long scheduleId, ScheduleActivityRequest request) {
		Schedule schedule = scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new ResourceNotFoundException("Schedule", scheduleId));
		ScheduleActivity activity = new ScheduleActivity();
		activity.setSchedule(schedule);
		apply(activity, request);
		if (request.getParentActivityId() != null) {
			activity.setParentActivity(activityRepository.findById(request.getParentActivityId())
					.orElseThrow(() -> new ResourceNotFoundException("Parent schedule activity", request.getParentActivityId())));
		}
		return toResponse(activityRepository.save(activity));
	}

	@Transactional(readOnly = true)
	public List<ScheduleActivityResponse> list(Long scheduleId) {
		return activityRepository.findByScheduleId(scheduleId).stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public ScheduleActivityResponse get(Long activityId) {
		return toResponse(activityRepository.findById(activityId)
				.orElseThrow(() -> new ResourceNotFoundException("Schedule activity", activityId)));
	}

	@Transactional(readOnly = true)
	public List<ScheduleActivityResponse> listChildren(Long activityId) {
		return activityRepository.findByParentActivityId(activityId).stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<ScheduleActivityResponse> listByLevel(Long scheduleId, com.sihbackend.enums.ActivityLevel level) {
		return activityRepository.findByScheduleIdAndLevel(scheduleId, level).stream().map(this::toResponse).toList();
	}

	private void apply(ScheduleActivity activity, ScheduleActivityRequest request) {
		activity.setActivityCode(request.getActivityCode());
		activity.setActivityName(request.getActivityName());
		activity.setLevel(request.getLevel());
		activity.setDiscipline(request.getDiscipline());
		activity.setLocation(request.getLocation());
		activity.setPlannedStart(request.getPlannedStart());
		activity.setPlannedFinish(request.getPlannedFinish());
		activity.setPlannedProgress(request.getPlannedProgress());
		activity.setStatus(request.getStatus());
	}

	private ScheduleActivityResponse toResponse(ScheduleActivity activity) {
		return new ScheduleActivityResponse(activity.getId(), activity.getSchedule().getId(), activity.getActivityCode(),
				activity.getActivityName(), activity.getLevel(), activity.getParentActivity() == null ? null : activity.getParentActivity().getId(),
				activity.getDiscipline(), activity.getLocation(), activity.getPlannedStart(), activity.getPlannedFinish(),
				activity.getPlannedProgress(), activity.getActualStart(), activity.getActualFinish(),
				activity.getActualProgress(), activity.getStatus());
	}
}
