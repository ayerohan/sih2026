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
	private final ProjectService service;
	public ProjectController(ProjectService service) { this.service = service; }
	@PostMapping @ResponseStatus(HttpStatus.CREATED) public ProjectResponse createProject(@Valid @RequestBody ProjectRequest request) { return service.create(request); }
	@GetMapping public List<ProjectResponse> getAllProjects() { return service.findAll(); }
	@GetMapping("/{projectId}") public ProjectResponse getProjectById(@PathVariable Long projectId) { return service.findById(projectId); }
	@PutMapping("/{projectId}") public ProjectResponse updateProject(@PathVariable Long projectId, @Valid @RequestBody ProjectRequest request) { return service.update(projectId, request); }
}
