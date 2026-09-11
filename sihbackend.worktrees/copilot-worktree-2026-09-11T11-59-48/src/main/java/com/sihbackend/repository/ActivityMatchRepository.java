package com.sihbackend.repository;

import com.sihbackend.entity.ActivityMatch;
import com.sihbackend.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityMatchRepository extends JpaRepository<ActivityMatch, Long> {
	List<ActivityMatch> findByExtractedEventId(Long extractedEventId);
	List<ActivityMatch> findByExtractedEventIdOrderByMatchScoreDesc(Long extractedEventId);
	List<ActivityMatch> findByStatus(MatchStatus status);
	List<ActivityMatch> findByExtractedEventProgressReportId(Long reportId);
}
