package com.sihbackend.service;

import com.sihbackend.enums.ActivityStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ExtractionService {
	private static final Pattern PROGRESS = Pattern.compile("(?:progress|complete(?:d)?)\\s*[:=]?\\s*(\\d{1,3})(?:\\.\\d+)?%", Pattern.CASE_INSENSITIVE);

	public ExtractedEventData extract(String rawText, LocalDate reportDate) {
		Matcher progressMatcher = PROGRESS.matcher(rawText);
		BigDecimal progress = progressMatcher.find() ? new BigDecimal(progressMatcher.group(1)) : BigDecimal.ZERO;
		ActivityStatus status = progress.compareTo(BigDecimal.valueOf(100)) >= 0 ? ActivityStatus.COMPLETED
				: progress.signum() > 0 ? ActivityStatus.IN_PROGRESS : ActivityStatus.NOT_STARTED;
		return new ExtractedEventData(rawText.trim(), null, null, reportDate, status, progress,
				BigDecimal.valueOf(0.60), "{\"method\":\"rule-based\"}");
	}
}
