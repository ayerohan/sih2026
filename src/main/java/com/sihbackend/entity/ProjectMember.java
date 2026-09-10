package com.sihbackend.entity;

import com.sihbackend.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_members", indexes = {
		@Index(name = "idx_member_project", columnList = "project_id"),
		@Index(name = "idx_member_user", columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor
public class ProjectMember {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id") private Project project;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
	@Enumerated(EnumType.STRING) @Column(nullable = false) private UserRole role;
	@Column(nullable = false, updatable = false) private OffsetDateTime joinedAt;
	@PrePersist void onCreate() { joinedAt = OffsetDateTime.now(); }
}
