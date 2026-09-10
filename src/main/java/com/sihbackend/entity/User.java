package com.sihbackend.entity;

import com.sihbackend.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.OffsetDateTime;

@Entity
@Table(name = "users", indexes = @Index(name = "idx_user_email", columnList = "email", unique = true))
@Getter @Setter @NoArgsConstructor
public class User {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
	@Column(nullable = false) private String name;
	@Column(nullable = false, unique = true) private String email;
	@Column(nullable = false) private String passwordHash;
	@Enumerated(EnumType.STRING) @Column(nullable = false) private UserRole role;
	@Column(nullable = false) private String status;
	@Column(nullable = false, updatable = false) private OffsetDateTime createdAt;
	@Column(nullable = false) private OffsetDateTime updatedAt;
	@PrePersist void onCreate() { createdAt = updatedAt = OffsetDateTime.now(); if (status == null) status = "ACTIVE"; }
	@PreUpdate void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
