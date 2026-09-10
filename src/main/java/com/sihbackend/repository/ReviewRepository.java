package com.sihbackend.repository;

import com.sihbackend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	List<Review> findByActivityMatchExtractedEventProgressReportProjectId(Long projectId);
}
