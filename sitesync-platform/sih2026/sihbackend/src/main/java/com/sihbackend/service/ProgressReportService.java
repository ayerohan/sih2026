package com.sihbackend.service;

import com.sihbackend.dto.*;
import com.sihbackend.entity.*;
import com.sihbackend.enums.MatchStatus;
import com.sihbackend.enums.ProcessingStatus;
import com.sihbackend.exception.ResourceNotFoundException;
import com.sihbackend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProgressReportService {
	private final ProgressReportRepository reportRepository;
	private final ProjectRepository projectRepository;
	private final ExtractedEventRepository eventRepository;
	private final ActivityMatchRepository matchRepository;
	private final ReviewRepository reviewRepository;
	private final ScheduleActivityRepository activityRepository;
	private final ExtractionService extractionService;
	private final ActivityMatchingService matchingService;
	private final ProgressUpdateService progressUpdateService;
	private final AuditService auditService;
	private final double confidenceThreshold;

	public ProgressReportService(ProgressReportRepository reportRepository, ProjectRepository projectRepository,
								 ExtractedEventRepository eventRepository, ActivityMatchRepository matchRepository,
								 ReviewRepository reviewRepository, ScheduleActivityRepository activityRepository,
								 ExtractionService extractionService, ActivityMatchingService matchingService,
								 ProgressUpdateService progressUpdateService, AuditService auditService,
								 @Value("${app.matching.confidence-threshold:0.75}") double confidenceThreshold) {
		this.reportRepository = reportRepository; this.projectRepository = projectRepository;
		this.eventRepository = eventRepository; this.matchRepository = matchRepository;
		this.reviewRepository = reviewRepository; this.activityRepository = activityRepository;
		this.extractionService = extractionService; this.matchingService = matchingService;
		this.progressUpdateService = progressUpdateService; this.auditService = auditService;
		this.confidenceThreshold = confidenceThreshold;
	}

	@Transactional
	public ProgressReportSummary createReport(Long projectId, com.sihbackend.dto.ProgressReportRequest request) {
		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
		ProgressReport report = new ProgressReport(); report.setProject(project);
		report.setTitle(request.getTitle()); report.setRawText(request.getRawText());
		report.setReportDate(request.getReportDate()); report.setReportType(request.getReportType());
		report.setSubmittedBy(request.getSubmittedBy()); report.setSourceDocumentId(request.getSourceDocumentId());
		return toSummary(reportRepository.save(report));
	}

	@Transactional(readOnly = true)
	public List<ProgressReportSummary> listReports(Long projectId) {
		return reportRepository.findAll().stream().filter(report -> report.getProject().getId().equals(projectId))
				.map(this::toSummary).toList();
	}

	@Transactional(readOnly = true)
	public ProgressReportSummary getSummary(Long reportId) {
		return toSummary(reportRepository.findById(reportId)
				.orElseThrow(() -> new ResourceNotFoundException("Progress report", reportId)));
	}

	private ProgressReportSummary toSummary(ProgressReport report) {
		return new ProgressReportSummary(report.getId(), report.getProject().getId(), report.getTitle(), report.getRawText(),
				report.getReportDate(), report.getSubmittedAt(), report.getProcessingStatus());
	}

	@Transactional
	public ProgressReportResponse processReport(Long reportId) {
		ProgressReport report = reportRepository.findById(reportId)
				.orElseThrow(() -> new ResourceNotFoundException("Progress report", reportId));
		if (report.getProcessingStatus() == ProcessingStatus.PROCESSED) {
			throw new IllegalStateException("Progress report has already been processed: " + reportId);
		}

		ExtractedEventData data = extractionService.extract(report.getRawText(), report.getReportDate());
		ExtractedEvent event = new ExtractedEvent();
		event.setProgressReport(report);
		event.setActivityDescription(data.activityDescription()); event.setDiscipline(data.discipline());
		event.setLocation(data.location()); event.setEventDate(data.eventDate()); event.setStatus(data.status());
		event.setProgressPercentage(data.progressPercentage()); event.setExtractionConfidence(data.confidence());
		event.setExtractedData(data.extractedData());
		final ExtractedEvent extractedEvent = eventRepository.save(event);

		List<ScheduleActivity> activities = activityRepository.findByScheduleProjectIdAndLevelIn(
				report.getProject().getId(), List.of(com.sihbackend.enums.ActivityLevel.L5, com.sihbackend.enums.ActivityLevel.L6));
		List<ActivityMatchResult> candidates = matchingService.findMatches(data, activities);
		List<ActivityMatch> matches = candidates.stream().map(candidate -> {
			ActivityMatch match = new ActivityMatch(); match.setExtractedEvent(extractedEvent);
			match.setScheduleActivity(candidate.activity()); match.setMatchScore(candidate.score());
			match.setMatchingMethod(candidate.method());
			match.setStatus(candidate == candidates.get(0) && candidate.score().doubleValue() >= confidenceThreshold
					? MatchStatus.AUTO_LINKED : MatchStatus.PENDING_REVIEW);
			return matchRepository.save(match);
		}).toList();

		boolean autoLinked = !matches.isEmpty() && matches.get(0).getStatus() == MatchStatus.AUTO_LINKED;
		if (autoLinked) {
			ActivityMatch best = matches.get(0);
			progressUpdateService.apply(extractedEvent, best.getScheduleActivity(), report.getSubmittedBy());
			auditService.record(report.getProject(), "ScheduleActivity", best.getScheduleActivity().getId(),
					"ACTUAL_PROGRESS_UPDATED", null, data.progressPercentage().toString(), report.getSubmittedBy(),
					"Automatically linked high-confidence field report");
		} else {
			matches.forEach(match -> {
				Review review = new Review(); review.setActivityMatch(match); review.setDecision("PENDING");
				reviewRepository.save(review);
			});
		}
		report.setProcessingStatus(ProcessingStatus.PROCESSED); reportRepository.save(report);
		return toResponse(report, extractedEvent, matches, autoLinked);
	}

	private ProgressReportResponse toResponse(ProgressReport report, ExtractedEvent event,
											  List<ActivityMatch> matches, boolean autoLinked) {
		ExtractedEventResponse eventResponse = new ExtractedEventResponse(event.getId(), event.getActivityDescription(),
				event.getDiscipline(), event.getLocation(), event.getEventDate(), event.getStatus(),
				event.getProgressPercentage(), event.getExtractionConfidence());
		List<ActivityMatchResponse> matchResponses = matches.stream().map(match -> new ActivityMatchResponse(
				match.getId(), match.getScheduleActivity().getId(), match.getScheduleActivity().getActivityCode(),
				match.getScheduleActivity().getActivityName(), match.getMatchScore(), match.getStatus())).toList();
		return new ProgressReportResponse(report.getId(), report.getProcessingStatus(), eventResponse, matchResponses, autoLinked);
	}
}
