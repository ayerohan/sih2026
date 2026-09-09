package com.sihbackend.entity;

import com.sihbackend.enums.ProcessingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "progress_reports", indexes = @Index(name = "idx_report_project", columnList = "project_id"))
@Getter @Setter @NoArgsConstructor
public class ProgressReport {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id") private Project project;
	private Long submittedBy;
	private String reportType;
	private String title;
	@Lob @Column(nullable = false) private String rawText;
	private LocalDate reportDate;
	@Column(nullable = false, updatable = false) private OffsetDateTime submittedAt;
	private String sourceDocumentId;
	@Enumerated(EnumType.STRING) @Column(nullable = false) private ProcessingStatus processingStatus;
	@PrePersist void onCreate() { submittedAt = OffsetDateTime.now(); if (processingStatus == null) processingStatus = ProcessingStatus.RECEIVED; }
}
