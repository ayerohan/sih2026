package com.sihbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProgressReportRequest {
	private String title;
	@NotBlank private String rawText;
	@NotNull private LocalDate reportDate;
	private String reportType;
	private String sourceDocumentId;

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getRawText() { return rawText; }
	public void setRawText(String rawText) { this.rawText = rawText; }
	public LocalDate getReportDate() { return reportDate; }
	public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }
	public String getReportType() { return reportType; }
	public void setReportType(String reportType) { this.reportType = reportType; }
	public String getSourceDocumentId() { return sourceDocumentId; }
	public void setSourceDocumentId(String sourceDocumentId) { this.sourceDocumentId = sourceDocumentId; }
}
