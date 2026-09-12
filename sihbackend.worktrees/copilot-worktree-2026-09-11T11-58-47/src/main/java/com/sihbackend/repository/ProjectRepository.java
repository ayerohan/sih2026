package com.sihbackend.repository;

import com.sihbackend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
	Optional<Project> findByProjectCode(String projectCode);

	Optional<Project> findByName(String name);
}
