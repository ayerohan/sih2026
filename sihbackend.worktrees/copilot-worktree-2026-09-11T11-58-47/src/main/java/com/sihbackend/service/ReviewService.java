package com.sihbackend.service;

import com.sihbackend.dto.ReviewRequest;
import com.sihbackend.dto.ReviewResponse;
import com.sihbackend.entity.ActivityMatch;
import com.sihbackend.entity.Review;
import com.sihbackend.entity.ScheduleActivity;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ActivityMatchRepository;
import com.sihbackend.repository.ReviewRepository;
import com.sihbackend.repository.ScheduleActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
	private final ReviewRepository reviewRepository;
	private final ActivityMatchRepository matchRepository;
	private final ScheduleActivityRepository activityRepository;

	public ReviewService(ReviewRepository reviewRepository, ActivityMatchRepository matchRepository,
						ScheduleActivityRepository activityRepository) {
		this.reviewRepository = reviewRepository;
		this.matchRepository = matchRepository;
		this.activityRepository = activityRepository;
	}

	@Transactional
	public ReviewResponse create(Long matchId, ReviewRequest request) {
		ActivityMatch match = matchRepository.findById(matchId)
				.orElseThrow(() -> new ResourceNotFoundException("Activity match", matchId));
		if (request.getSelectedActivityId() != null) {
			ScheduleActivity activity = activityRepository.findById(request.getSelectedActivityId())
					.orElseThrow(() -> new ResourceNotFoundException("Schedule activity", request.getSelectedActivityId()));
			match.setScheduleActivity(activity);
			matchRepository.save(match);
		}
		Review review = new Review();
		review.setActivityMatch(match);
		review.setDecision(request.getDecision());
		review.setComment(request.getComment());
		return toResponse(reviewRepository.save(review));
	}

	private ReviewResponse toResponse(Review review) {
		return new ReviewResponse(review.getId(), review.getActivityMatch().getId(), review.getReviewerId(),
				review.getDecision(), review.getComment(), review.getReviewedAt());
	}
}
