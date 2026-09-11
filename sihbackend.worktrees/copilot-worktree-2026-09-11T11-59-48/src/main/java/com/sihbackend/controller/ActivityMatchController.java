package com.sihbackend.controller;

import com.sihbackend.dto.ActivityMatchResponse;
import com.sihbackend.service.ActivityMatchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ActivityMatchController {
	private final ActivityMatchService matchService;

	public ActivityMatchController(ActivityMatchService matchService) {
		this.matchService = matchService;
	}

	@GetMapping("/progress-reports/{reportId}/matches")
	public List<ActivityMatchResponse> list(@PathVariable Long reportId) {
		return matchService.listForReport(reportId);
	}

	@GetMapping("/matches/{matchId}")
	public ActivityMatchResponse get(@PathVariable Long matchId) {
		return matchService.get(matchId);
	}
}
