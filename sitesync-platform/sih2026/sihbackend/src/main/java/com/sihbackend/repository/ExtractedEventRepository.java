package com.sihbackend.repository;

import com.sihbackend.entity.ExtractedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExtractedEventRepository extends JpaRepository<ExtractedEvent, Long> {
}
