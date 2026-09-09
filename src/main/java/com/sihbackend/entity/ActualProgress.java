package com.sihbackend.entity;

import com.sihbackend.enums.ActivityStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity @Table(name = "actual_progress", indexes = @Index(name = "idx_actual_activity", columnList = "schedule_activity_id"))
@Getter @Setter @NoArgsConstructor
public class ActualProgress {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "schedule_activity_id") private ScheduleActivity scheduleActivity;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "extracted_event_id") private ExtractedEvent extractedEvent;
	private LocalDate actualStart;
	private LocalDate actualFinish;
	private BigDecimal progressPercentage;
	@Enumerated(EnumType.STRING) private ActivityStatus status;
	private Long updatedBy;
	@Column(nullable = false) private OffsetDateTime updatedAt;
	@PrePersist @PreUpdate void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
