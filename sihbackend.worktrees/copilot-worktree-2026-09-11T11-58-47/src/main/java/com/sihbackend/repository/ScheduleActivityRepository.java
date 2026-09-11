package com.sihbackend.repository;

import com.sihbackend.entity.ScheduleActivity;
import com.sihbackend.enums.ActivityLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ScheduleActivityRepository extends JpaRepository<ScheduleActivity, Long> {
	List<ScheduleActivity> findByScheduleProjectId(Long projectId);
	List<ScheduleActivity> findByScheduleProjectIdAndLevelIn(Long projectId, Collection<ActivityLevel> levels);
	List<ScheduleActivity> findByScheduleId(Long scheduleId);
	List<ScheduleActivity> findByScheduleIdAndLevel(Long scheduleId, ActivityLevel level);
	Optional<ScheduleActivity> findByScheduleIdAndActivityCode(Long scheduleId, String activityCode);
	List<ScheduleActivity> findByParentActivityId(Long activityId);
}
