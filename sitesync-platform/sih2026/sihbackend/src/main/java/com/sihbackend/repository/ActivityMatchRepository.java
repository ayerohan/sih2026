package com.sihbackend.repository;

import com.sihbackend.entity.ActivityMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityMatchRepository extends JpaRepository<ActivityMatch, Long> {
	List<ActivityMatch> findByExtractedEventProgressReportId(Long reportId);
}
