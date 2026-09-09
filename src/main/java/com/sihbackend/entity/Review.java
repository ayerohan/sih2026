package com.sihbackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity @Table(name = "reviews")
@Getter @Setter @NoArgsConstructor
public class Review {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "activity_match_id") private ActivityMatch activityMatch;
	private Long reviewerId;
	@Column(nullable = false) private String decision;
	private String comment;
	@Column(nullable = false) private OffsetDateTime reviewedAt;
	@PrePersist void onCreate() { reviewedAt = OffsetDateTime.now(); }
}
