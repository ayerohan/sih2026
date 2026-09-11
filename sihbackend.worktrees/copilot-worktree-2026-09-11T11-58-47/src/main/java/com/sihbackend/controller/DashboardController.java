package com.sihbackend.controller;

import com.sihbackend.dto.DashboardResponse;
import com.sihbackend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class DashboardController {
	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@GetMapping("/{projectId}/dashboard")
	public DashboardResponse get(@PathVariable Long projectId) {
		return dashboardService.get(projectId);
	}
}
