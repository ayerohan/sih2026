package com.sihbackend.entity;

import com.sihbackend.enums.ActivityStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "extracted_events", indexes = @Index(name = "idx_event_report", columnList = "progress_report_id"))
@Getter @Setter @NoArgsConstructor
public class ExtractedEvent {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "progress_report_id") private ProgressReport progressReport;
	private String activityDescription;
	private String discipline;
	private String location;
	private LocalDate eventDate;
	@Enumerated(EnumType.STRING) private ActivityStatus status;
	private BigDecimal progressPercentage;
	@JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb") private String extractedData;
	private BigDecimal extractionConfidence;
	@Column(nullable = false, updatable = false) private OffsetDateTime createdAt;
	@PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }
}
