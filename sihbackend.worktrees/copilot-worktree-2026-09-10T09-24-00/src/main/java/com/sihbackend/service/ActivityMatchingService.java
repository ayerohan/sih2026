package com.sihbackend.service;

import com.sihbackend.entity.ScheduleActivity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ActivityMatchingService {
	public List<ActivityMatchResult> findMatches(ExtractedEventData event, List<ScheduleActivity> activities) {
		Set<String> reportWords = words(event.activityDescription());
		return activities.stream()
				.map(activity -> new ActivityMatchResult(activity, score(reportWords, activity), "rule-based"))
				.filter(result -> result.score().signum() > 0)
				.sorted(Comparator.comparing(ActivityMatchResult::score).reversed()).toList();
	}

	private BigDecimal score(Set<String> reportWords, ScheduleActivity activity) {
		Set<String> activityWords = words(activity.getActivityName());
		if (activityWords.isEmpty()) return BigDecimal.ZERO;
		long overlap = reportWords.stream().filter(activityWords::contains).count();
		return BigDecimal.valueOf(Math.min(1.0, (double) overlap / activityWords.size()));
	}

	private Set<String> words(String value) {
		return Arrays.stream(value.toLowerCase(Locale.ROOT).split("\\W+"))
				.filter(word -> word.length() > 2).collect(Collectors.toSet());
	}
}
