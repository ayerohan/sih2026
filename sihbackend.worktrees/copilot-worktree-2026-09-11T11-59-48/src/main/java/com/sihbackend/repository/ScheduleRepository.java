package com.sihbackend.repository;

import com.sihbackend.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
	List<Schedule> findByProjectId(Long projectId);
	List<Schedule> findByProjectIdAndStatus(Long projectId, String status);
}
