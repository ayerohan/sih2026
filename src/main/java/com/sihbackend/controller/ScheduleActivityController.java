package com.sihbackend.controller;

import com.sihbackend.dto.ScheduleActivityRequest;
import com.sihbackend.dto.ScheduleActivityResponse;
import com.sihbackend.enums.ActivityLevel;
import com.sihbackend.service.ScheduleActivityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ScheduleActivityController {
	private final ScheduleActivityService service;
	public ScheduleActivityController(ScheduleActivityService service) { this.service = service; }
	@PostMapping("/schedules/{scheduleId}/activities") @ResponseStatus(HttpStatus.CREATED) public ScheduleActivityResponse createActivity(@PathVariable Long scheduleId, @Valid @RequestBody ScheduleActivityRequest request) { return service.create(scheduleId, request); }
	@GetMapping("/schedules/{scheduleId}/activities") public List<ScheduleActivityResponse> getScheduleActivities(@PathVariable Long scheduleId) { return service.findBySchedule(scheduleId); }
	@GetMapping("/schedules/{scheduleId}/activities/level/{level}") public List<ScheduleActivityResponse> getActivitiesByLevel(@PathVariable Long scheduleId, @PathVariable ActivityLevel level) { return service.findByLevel(scheduleId, level); }
	@GetMapping("/activities/{activityId}") public ScheduleActivityResponse getActivityById(@PathVariable Long activityId) { return service.findById(activityId); }
	@GetMapping("/activities/{activityId}/children") public List<ScheduleActivityResponse> getChildActivities(@PathVariable Long activityId) { return service.findChildren(activityId); }
}
