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
	private final ScheduleService service;
	public ScheduleController(ScheduleService service) { this.service = service; }
	@PostMapping("/projects/{projectId}/schedules") @ResponseStatus(HttpStatus.CREATED) public ScheduleResponse createSchedule(@PathVariable Long projectId, @Valid @RequestBody ScheduleRequest request) { return service.create(projectId, request); }
	@GetMapping("/projects/{projectId}/schedules") public List<ScheduleResponse> getProjectSchedules(@PathVariable Long projectId) { return service.findByProject(projectId); }
	@GetMapping("/schedules/{scheduleId}") public ScheduleResponse getScheduleById(@PathVariable Long scheduleId) { return service.findById(scheduleId); }
}
