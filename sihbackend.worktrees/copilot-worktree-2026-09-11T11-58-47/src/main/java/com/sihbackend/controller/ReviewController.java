package com.sihbackend.controller;

import com.sihbackend.dto.ReviewRequest;
import com.sihbackend.dto.ReviewResponse;
import com.sihbackend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
public class ReviewController {
	private final ReviewService reviewService;

	public ReviewController(ReviewService reviewService) { this.reviewService = reviewService; }

	@PostMapping("/{matchId}/review")
	@ResponseStatus(HttpStatus.CREATED)
	public ReviewResponse create(@PathVariable Long matchId, @Valid @RequestBody ReviewRequest request) {
		return reviewService.create(matchId, request);
	}
}
