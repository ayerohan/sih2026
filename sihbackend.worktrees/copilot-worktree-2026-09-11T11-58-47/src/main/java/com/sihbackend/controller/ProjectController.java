package com.sihbackend.controller;

import com.sihbackend.dto.ProjectRequest;
import com.sihbackend.dto.ProjectResponse;
import com.sihbackend.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
	private final ProjectService projectService;

	public ProjectController(ProjectService projectService) { this.projectService = projectService; }

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ProjectResponse create(@Valid @RequestBody ProjectRequest request) { return projectService.create(request); }

	@GetMapping
	public List<ProjectResponse> list() { return projectService.list(); }

	@GetMapping("/{projectId}")
	public ProjectResponse get(@PathVariable Long projectId) { return projectService.get(projectId); }

	@PutMapping("/{projectId}")
	public ProjectResponse update(@PathVariable Long projectId, @Valid @RequestBody ProjectRequest request) {
		return projectService.update(projectId, request);
	}
}
