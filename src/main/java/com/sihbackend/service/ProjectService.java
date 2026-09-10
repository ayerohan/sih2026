package com.sihbackend.service;

import com.sihbackend.dto.ProjectRequest;
import com.sihbackend.dto.ProjectResponse;
import com.sihbackend.entity.Project;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProjectService {
	private final ProjectRepository repository;

	public ProjectService(ProjectRepository repository) { this.repository = repository; }

	@Transactional public ProjectResponse create(ProjectRequest request) {
		Project project = new Project(); apply(project, request); return toResponse(repository.save(project));
	}
	@Transactional(readOnly = true) public List<ProjectResponse> findAll() {
		return repository.findAll().stream().map(this::toResponse).toList();
	}
	@Transactional(readOnly = true) public ProjectResponse findById(Long id) { return toResponse(get(id)); }
	@Transactional public ProjectResponse update(Long id, ProjectRequest request) {
		Project project = get(id); apply(project, request); return toResponse(repository.save(project));
	}
	public Project get(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project", id)); }
	private void apply(Project project, ProjectRequest request) {
		project.setName(request.name()); project.setProjectCode(request.projectCode()); project.setDescription(request.description());
		project.setLocation(request.location()); project.setStartDate(request.startDate()); project.setPlannedEndDate(request.plannedEndDate());
		if (project.getStatus() == null) project.setStatus("ACTIVE");
	}
	private ProjectResponse toResponse(Project p) { return new ProjectResponse(p.getId(), p.getName(), p.getProjectCode(), p.getDescription(), p.getLocation(), p.getStartDate(), p.getPlannedEndDate(), p.getStatus(), p.getCreatedAt(), p.getUpdatedAt()); }
}
