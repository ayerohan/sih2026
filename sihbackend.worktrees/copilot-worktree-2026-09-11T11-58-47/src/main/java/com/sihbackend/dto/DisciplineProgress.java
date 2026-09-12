package com.sihbackend.dto;

import java.math.BigDecimal;

public record DisciplineProgress(String discipline, BigDecimal plannedProgress, BigDecimal actualProgress) {
}