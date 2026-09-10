package com.sihbackend.service;

import com.sihbackend.entity.ActualProgress;
import com.sihbackend.entity.ExtractedEvent;
import com.sihbackend.entity.ScheduleActivity;
import com.sihbackend.entity.User;
import com.sihbackend.repository.ActualProgressRepository;
import com.sihbackend.enums.ActivityStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ProgressUpdateService {
	private final ActualProgressRepository actualProgressRepository;

	public ProgressUpdateService(ActualProgressRepository actualProgressRepository) { this.actualProgressRepository = actualProgressRepository; }

	public ActualProgress apply(ExtractedEvent event, ScheduleActivity activity, User updatedBy) {
		ActualProgress progress = new ActualProgress();
		progress.setScheduleActivity(activity); progress.setExtractedEvent(event);
		progress.setActualStart(event.getEventDate());
		progress.setActualFinish(event.getStatus() == ActivityStatus.COMPLETED ? event.getEventDate() : null);
		progress.setProgressPercentage(event.getProgressPercentage() == null ? BigDecimal.ZERO : event.getProgressPercentage());
		progress.setStatus(event.getStatus()); progress.setUpdatedBy(updatedBy);
		activity.setActualProgress(progress.getProgressPercentage()); activity.setStatus(event.getStatus());
		if (event.getStatus() == ActivityStatus.COMPLETED) activity.setActualFinish(event.getEventDate());
		return actualProgressRepository.save(progress);
	}
}
