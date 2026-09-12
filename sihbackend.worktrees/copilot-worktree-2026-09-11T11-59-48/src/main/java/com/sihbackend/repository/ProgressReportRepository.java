package com.sihbackend.repository;

import com.sihbackend.entity.ProgressReport;
import com.sihbackend.enums.ProcessingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressReportRepository extends JpaRepository<ProgressReport, Long> {
	List<ProgressReport> findByProjectId(Long projectId);

	List<ProgressReport> findByProjectIdOrderBySubmittedAtDesc(Long projectId);

	List<ProgressReport> findByProcessingStatus(ProcessingStatus processingStatus);
}
