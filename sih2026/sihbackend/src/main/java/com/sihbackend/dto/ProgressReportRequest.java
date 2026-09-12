package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ProgressReportRequest {
	@NotBlank private String title;
	@NotBlank private String rawText;
	@NotNull private LocalDate reportDate;
	private String reportType;
	private Long submittedBy;
	private String sourceDocumentId;

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getRawText() { return rawText; }
	public void setRawText(String rawText) { this.rawText = rawText; }
	public LocalDate getReportDate() { return reportDate; }
	public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }
	public String getReportType() { return reportType; }
	public void setReportType(String reportType) { this.reportType = reportType; }
	public Long getSubmittedBy() { return submittedBy; }
	public void setSubmittedBy(Long submittedBy) { this.submittedBy = submittedBy; }
	public String getSourceDocumentId() { return sourceDocumentId; }
	public void setSourceDocumentId(String sourceDocumentId) { this.sourceDocumentId = sourceDocumentId; }
}
