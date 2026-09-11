package com.sihbackend.controller;

import com.sihbackend.dto.ProgressReportRequest;
import com.sihbackend.dto.ProgressReportResponse;
import com.sihbackend.dto.ProgressReportSummary;
import com.sihbackend.service.ProgressReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProgressReportController {
	private final ProgressReportService progressReportService;

	public ProgressReportController(ProgressReportService progressReportService) {
		this.progressReportService = progressReportService;
	}

	@PostMapping("/projects/{projectId}/progress-reports")
	@ResponseStatus(HttpStatus.CREATED)
	public ProgressReportSummary create(@PathVariable Long projectId, @Valid @RequestBody ProgressReportRequest request) {
		return progressReportService.createReport(projectId, request);
	}

	@GetMapping("/projects/{projectId}/progress-reports")
	public List<ProgressReportSummary> list(@PathVariable Long projectId) {
		return progressReportService.listReports(projectId);
	}

	@GetMapping("/progress-reports/{id}")
	public ProgressReportSummary get(@PathVariable Long id) { return progressReportService.getSummary(id); }

	@PostMapping("/progress-reports/{id}/process")
	public ProgressReportResponse process(@PathVariable Long id) { return progressReportService.processReport(id); }
}
