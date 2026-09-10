package com.sihbackend.controller;

import com.sihbackend.dto.ActivityMatchResponse;
import com.sihbackend.service.ActivityMatchingService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ActivityMatchController {
	private final ActivityMatchingService service;
	public ActivityMatchController(ActivityMatchingService service) { this.service = service; }
	@GetMapping("/progress-reports/{reportId}/matches") public List<ActivityMatchResponse> getMatchesForReport(@PathVariable Long reportId) { return service.findByReport(reportId); }
	@GetMapping("/matches/{matchId}") public ActivityMatchResponse getMatchById(@PathVariable Long matchId) { return service.findById(matchId); }
}
