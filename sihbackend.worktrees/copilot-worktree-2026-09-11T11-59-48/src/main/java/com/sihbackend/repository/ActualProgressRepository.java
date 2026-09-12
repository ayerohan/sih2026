package com.sihbackend.repository;

import com.sihbackend.entity.ActualProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActualProgressRepository extends JpaRepository<ActualProgress, Long> {
	List<ActualProgress> findByScheduleActivityId(Long scheduleActivityId);

	List<ActualProgress> findByScheduleActivityIdOrderByUpdatedAtDesc(Long scheduleActivityId);
}
