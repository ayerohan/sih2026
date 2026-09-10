package com.sihbackend.controller;

import com.sihbackend.dto.DashboardResponse;
import com.sihbackend.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class DashboardController {
	private final DashboardService service;
	public DashboardController(DashboardService service) { this.service = service; }
	@GetMapping("/{projectId}/dashboard") public DashboardResponse getProjectDashboard(@PathVariable Long projectId) { return service.getProjectDashboard(projectId); }
}
