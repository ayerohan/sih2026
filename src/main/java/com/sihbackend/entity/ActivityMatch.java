package com.sihbackend.entity;

import com.sihbackend.enums.MatchStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "activity_matches", indexes = {
		@Index(name = "idx_match_event", columnList = "extracted_event_id"),
		@Index(name = "idx_match_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor
public class ActivityMatch {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "extracted_event_id") private ExtractedEvent extractedEvent;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "schedule_activity_id") private ScheduleActivity scheduleActivity;
	@Column(nullable = false, precision = 5, scale = 4) private BigDecimal matchScore;
	private String matchingMethod;
	@Enumerated(EnumType.STRING) @Column(nullable = false) private MatchStatus status;
	private OffsetDateTime matchedAt;
	@PrePersist void onCreate() { matchedAt = OffsetDateTime.now(); }
}
