package com.sihbackend.repository;

import com.sihbackend.entity.ExtractedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExtractedEventRepository extends JpaRepository<ExtractedEvent, Long> {
	List<ExtractedEvent> findByProgressReportId(Long progressReportId);
}
