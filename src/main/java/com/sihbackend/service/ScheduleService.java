package com.sihbackend.service;

import com.sihbackend.dto.ScheduleRequest;
import com.sihbackend.dto.ScheduleResponse;
import com.sihbackend.entity.Schedule;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class ScheduleService {
	private final ScheduleRepository repository;
	private final ProjectService projectService;
	private final com.sihbackend.repository.UserRepository userRepository;
	public ScheduleService(ScheduleRepository repository, ProjectService projectService, com.sihbackend.repository.UserRepository userRepository) { this.repository = repository; this.projectService = projectService; this.userRepository = userRepository; }
	@Transactional public ScheduleResponse create(Long projectId, ScheduleRequest request) {
		Schedule schedule = new Schedule(); schedule.setProject(projectService.get(projectId)); schedule.setName(request.name());
		schedule.setSourceType(request.sourceType()); schedule.setVersion(request.version()); schedule.setUploadedBy(request.uploadedBy() == null ? null : userRepository.getReferenceById(request.uploadedBy()));
		schedule.setStatus(request.status() == null ? "ACTIVE" : request.status()); schedule.setUploadedAt(OffsetDateTime.now());
		return toResponse(repository.save(schedule));
	}
	@Transactional(readOnly = true) public List<ScheduleResponse> findByProject(Long projectId) { return repository.findByProjectId(projectId).stream().map(this::toResponse).toList(); }
	@Transactional(readOnly = true) public ScheduleResponse findById(Long id) { return toResponse(get(id)); }
	public Schedule get(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Schedule", id)); }
	private ScheduleResponse toResponse(Schedule s) { return new ScheduleResponse(s.getId(), s.getProject().getId(), s.getName(), s.getSourceType(), s.getVersion(), s.getUploadedBy() == null ? null : s.getUploadedBy().getId(), s.getUploadedAt(), s.getStatus()); }
}
