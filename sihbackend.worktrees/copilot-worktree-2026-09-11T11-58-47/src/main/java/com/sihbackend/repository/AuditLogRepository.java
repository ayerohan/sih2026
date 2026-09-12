package com.sihbackend.repository;

import com.sihbackend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
	List<AuditLog> findByProjectIdOrderByPerformedAtDesc(Long projectId);

	List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
