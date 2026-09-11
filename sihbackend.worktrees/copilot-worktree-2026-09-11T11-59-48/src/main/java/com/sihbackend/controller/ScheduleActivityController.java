package com.sihbackend.controller;

import com.sihbackend.dto.ScheduleActivityRequest;
import com.sihbackend.dto.ScheduleActivityResponse;
import com.sihbackend.service.ScheduleActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ScheduleActivityController {
	private final ScheduleActivityService activityService;

	public ScheduleActivityController(ScheduleActivityService activityService) { this.activityService = activityService; }

	@PostMapping("/schedules/{scheduleId}/activities")
	@ResponseStatus(HttpStatus.CREATED)
	public ScheduleActivityResponse create(@PathVariable Long scheduleId,
											 @Valid @RequestBody ScheduleActivityRequest request) {
		return activityService.create(scheduleId, request);
	}

	@GetMapping("/schedules/{scheduleId}/activities")
	public List<ScheduleActivityResponse> list(@PathVariable Long scheduleId) {
		return activityService.list(scheduleId);
	}

	@GetMapping("/schedules/{scheduleId}/activities/level/{level}")
	public List<ScheduleActivityResponse> listByLevel(@PathVariable Long scheduleId,
			@PathVariable com.sihbackend.enums.ActivityLevel level) {
		return activityService.listByLevel(scheduleId, level);
	}

	@GetMapping("/activities/{activityId}")
	public ScheduleActivityResponse get(@PathVariable Long activityId) { return activityService.get(activityId); }

	@GetMapping("/activities/{activityId}/children")
	public List<ScheduleActivityResponse> listChildren(@PathVariable Long activityId) {
		return activityService.listChildren(activityId);
	}
}
