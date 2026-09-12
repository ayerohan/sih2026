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
	private final ProjectRepository projectRepository;

	public ProjectService(ProjectRepository projectRepository) {
		this.projectRepository = projectRepository;
	}

	@Transactional
	public ProjectResponse create(ProjectRequest request) {
		Project project = new Project();
		apply(project, request);
		return toResponse(projectRepository.save(project));
	}

	@Transactional(readOnly = true)
	public List<ProjectResponse> list() {
		return projectRepository.findAll().stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public ProjectResponse get(Long projectId) {
		return toResponse(projectRepository.findById(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", projectId)));
	}

	@Transactional
	public ProjectResponse update(Long projectId, ProjectRequest request) {
		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
		project.setName(request.getName());
		project.setDescription(request.getDescription());
		project.setLocation(request.getLocation());
		project.setStartDate(request.getStartDate());
		project.setPlannedEndDate(request.getPlannedEndDate());
		project.setStatus(request.getStatus());
		return toResponse(projectRepository.save(project));
	}

	private void apply(Project project, ProjectRequest request) {
		project.setName(request.getName());
		project.setProjectCode(request.getProjectCode());
		project.setDescription(request.getDescription());
		project.setLocation(request.getLocation());
		project.setStartDate(request.getStartDate());
		project.setPlannedEndDate(request.getPlannedEndDate());
		project.setStatus(request.getStatus());
	}

	private ProjectResponse toResponse(Project project) {
		return new ProjectResponse(project.getId(), project.getName(), project.getProjectCode(),
				project.getDescription(), project.getLocation(), project.getStartDate(),
				project.getPlannedEndDate(), project.getStatus(), project.getCreatedAt(), project.getUpdatedAt());
	}
}
