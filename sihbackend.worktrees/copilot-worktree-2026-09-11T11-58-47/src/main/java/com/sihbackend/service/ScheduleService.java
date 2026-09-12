package com.sihbackend.service;

import com.sihbackend.dto.ScheduleRequest;
import com.sihbackend.dto.ScheduleResponse;
import com.sihbackend.entity.Project;
import com.sihbackend.entity.Schedule;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ProjectRepository;
import com.sihbackend.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ScheduleService {
	private final ScheduleRepository scheduleRepository;
	private final ProjectRepository projectRepository;

	public ScheduleService(ScheduleRepository scheduleRepository, ProjectRepository projectRepository) {
		this.scheduleRepository = scheduleRepository;
		this.projectRepository = projectRepository;
	}

	@Transactional
	public ScheduleResponse create(Long projectId, ScheduleRequest request) {
		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
		Schedule schedule = new Schedule();
		schedule.setProject(project);
		schedule.setName(request.getName());
		schedule.setSourceType(request.getSourceType());
		schedule.setVersion(request.getVersion());
		schedule.setStatus(request.getStatus());
		return toResponse(scheduleRepository.save(schedule));
	}

	@Transactional(readOnly = true)
	public List<ScheduleResponse> list(Long projectId) {
		return scheduleRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public ScheduleResponse get(Long scheduleId) {
		return toResponse(scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new ResourceNotFoundException("Schedule", scheduleId)));
	}

	private ScheduleResponse toResponse(Schedule schedule) {
		return new ScheduleResponse(schedule.getId(), schedule.getProject().getId(), schedule.getName(),
				schedule.getSourceType(), schedule.getVersion(), schedule.getUploadedBy(),
				schedule.getUploadedAt(), schedule.getStatus());
	}
}
