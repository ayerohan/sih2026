package com.sihbackend.controller;

import com.sihbackend.dto.ScheduleRequest;
import com.sihbackend.dto.ScheduleResponse;
import com.sihbackend.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ScheduleController {
	private final ScheduleService scheduleService;

	public ScheduleController(ScheduleService scheduleService) { this.scheduleService = scheduleService; }

	@PostMapping("/projects/{projectId}/schedules")
	@ResponseStatus(HttpStatus.CREATED)
	public ScheduleResponse create(@PathVariable Long projectId, @Valid @RequestBody ScheduleRequest request) {
		return scheduleService.create(projectId, request);
	}

	@GetMapping("/projects/{projectId}/schedules")
	public List<ScheduleResponse> list(@PathVariable Long projectId) { return scheduleService.list(projectId); }

	@GetMapping("/schedules/{scheduleId}")
	public ScheduleResponse get(@PathVariable Long scheduleId) { return scheduleService.get(scheduleId); }
}
