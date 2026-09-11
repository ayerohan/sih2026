package com.sihbackend.service;

import com.sihbackend.dto.ActivityMatchResponse;
import com.sihbackend.entity.ActivityMatch;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.ActivityMatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityMatchService {
	private final ActivityMatchRepository matchRepository;

	public ActivityMatchService(ActivityMatchRepository matchRepository) {
		this.matchRepository = matchRepository;
	}

	@Transactional(readOnly = true)
	public List<ActivityMatchResponse> listForReport(Long reportId) {
		return matchRepository.findByExtractedEventProgressReportId(reportId).stream()
				.sorted((left, right) -> right.getMatchScore().compareTo(left.getMatchScore()))
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public ActivityMatchResponse get(Long matchId) {
		return toResponse(matchRepository.findById(matchId)
				.orElseThrow(() -> new ResourceNotFoundException("Activity match", matchId)));
	}

	private ActivityMatchResponse toResponse(ActivityMatch match) {
		return new ActivityMatchResponse(match.getId(), match.getExtractedEvent().getId(),
				match.getScheduleActivity().getId(), match.getScheduleActivity().getActivityCode(),
				match.getScheduleActivity().getActivityName(), match.getMatchScore(),
				match.getMatchingMethod(), match.getStatus(), match.getMatchedAt());
	}
}
