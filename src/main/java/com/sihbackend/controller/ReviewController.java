package com.sihbackend.controller;

import com.sihbackend.dto.ReviewRequest;
import com.sihbackend.dto.ReviewResponse;
import com.sihbackend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {
	private final ReviewService service;
	public ReviewController(ReviewService service) { this.service = service; }
	@GetMapping("/projects/{projectId}/reviews") public List<ReviewResponse> getPendingReviews(@PathVariable Long projectId) { return service.findByProject(projectId); }
	@GetMapping("/reviews/{reviewId}") public ReviewResponse getReviewById(@PathVariable Long reviewId) { return service.findById(reviewId); }
	@PostMapping("/matches/{matchId}/review") public ReviewResponse reviewMatch(@PathVariable Long matchId, @Valid @RequestBody ReviewRequest request) { return service.review(matchId, request); }
}
