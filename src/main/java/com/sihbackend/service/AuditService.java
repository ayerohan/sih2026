package com.sihbackend.service;

import com.sihbackend.entity.AuditLog;
import com.sihbackend.entity.Project;
import com.sihbackend.entity.User;
import com.sihbackend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
	private final AuditLogRepository auditLogRepository;

	public AuditService(AuditLogRepository auditLogRepository) { this.auditLogRepository = auditLogRepository; }

	public void record(Project project, String entityType, Long entityId, String action,
					   String oldValue, String newValue, User performedBy, String reason) {
		AuditLog log = new AuditLog();
		log.setProject(project); log.setEntityType(entityType); log.setEntityId(entityId);
		log.setAction(action); log.setOldValue(oldValue); log.setNewValue(newValue);
		log.setPerformedBy(performedBy); log.setReason(reason); auditLogRepository.save(log);
	}
}
