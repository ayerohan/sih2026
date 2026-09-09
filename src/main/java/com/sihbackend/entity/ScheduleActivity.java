package com.sihbackend.entity;

import com.sihbackend.enums.ActivityLevel;
import com.sihbackend.enums.ActivityStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "schedule_activities", indexes = {
		@Index(name = "idx_activity_schedule", columnList = "schedule_id"),
		@Index(name = "idx_activity_parent", columnList = "parent_activity_id")
})
@Getter @Setter @NoArgsConstructor
public class ScheduleActivity {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "schedule_id") private Schedule schedule;
	@Column(nullable = false) private String activityCode;
	@Column(nullable = false) private String activityName;
	@Enumerated(EnumType.STRING) @Column(nullable = false) private ActivityLevel level;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_activity_id") private ScheduleActivity parentActivity;
	private String discipline;
	private String location;
	private LocalDate plannedStart;
	private LocalDate plannedFinish;
	private BigDecimal plannedProgress;
	private LocalDate actualStart;
	private LocalDate actualFinish;
	private BigDecimal actualProgress;
	@Enumerated(EnumType.STRING) private ActivityStatus status;
}
