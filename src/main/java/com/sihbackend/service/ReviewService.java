package com.sihbackend.service;

import com.sihbackend.dto.*;
import com.sihbackend.entity.*;
import com.sihbackend.enums.MatchStatus;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ReviewService {
	private final ReviewRepository reviewRepository;
	private final ActivityMatchingService matchingService;
	private final ProgressUpdateService progressUpdateService;
	private final AuditService auditService;
	private final com.sihbackend.repository.UserRepository userRepository;
	public ReviewService(ReviewRepository reviewRepository, ActivityMatchingService matchingService, ProgressUpdateService progressUpdateService, AuditService auditService, com.sihbackend.repository.UserRepository userRepository) { this.reviewRepository = reviewRepository; this.matchingService = matchingService; this.progressUpdateService = progressUpdateService; this.auditService = auditService; this.userRepository = userRepository; }
	@Transactional(readOnly = true) public List<ReviewResponse> findByProject(Long projectId) { return reviewRepository.findByActivityMatchExtractedEventProgressReportProjectId(projectId).stream().filter(r -> "PENDING".equals(r.getDecision())).map(this::toResponse).toList(); }
	@Transactional(readOnly = true) public ReviewResponse findById(Long id) { return toResponse(get(id)); }
	@Transactional public ReviewResponse review(Long matchId, ReviewRequest request) {
		ActivityMatch match = matchingService.get(matchId); Review review = reviewRepository.findAll().stream().filter(r -> r.getActivityMatch().getId().equals(matchId) && "PENDING".equals(r.getDecision())).findFirst().orElseGet(Review::new);
		review.setActivityMatch(match); review.setDecision(request.decision().toUpperCase()); review.setComment(request.comment()); review.setReviewer(request.reviewerId() == null ? null : userRepository.getReferenceById(request.reviewerId()));
		if ("ACCEPT".equals(review.getDecision())) { match.setStatus(MatchStatus.ACCEPTED); User reviewer = review.getReviewer(); progressUpdateService.apply(match.getExtractedEvent(), match.getScheduleActivity(), reviewer); auditService.record(match.getExtractedEvent().getProgressReport().getProject(), "ScheduleActivity", match.getScheduleActivity().getId(), "ACTUAL_PROGRESS_UPDATED", null, match.getExtractedEvent().getProgressPercentage().toString(), reviewer, "Accepted by planning engineer"); }
		else if ("REJECT".equals(review.getDecision())) match.setStatus(MatchStatus.REJECTED); else throw new IllegalArgumentException("Decision must be ACCEPT or REJECT");
		return toResponse(reviewRepository.save(review));
	}
	private Review get(Long id) { return reviewRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review", id)); }
	private ReviewResponse toResponse(Review r) { ActivityMatch m = r.getActivityMatch(); return new ReviewResponse(r.getId(), m.getId(), m.getExtractedEvent().getProgressReport().getProject().getId(), r.getDecision(), r.getComment(), r.getReviewer() == null ? null : r.getReviewer().getId(), r.getReviewedAt(), new ActivityMatchResponse(m.getId(), m.getScheduleActivity().getId(), m.getScheduleActivity().getActivityCode(), m.getScheduleActivity().getActivityName(), m.getMatchScore(), m.getStatus())); }
}
