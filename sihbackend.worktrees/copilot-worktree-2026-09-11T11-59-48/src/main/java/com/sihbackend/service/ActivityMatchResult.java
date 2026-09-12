package com.sihbackend.service;

import com.sihbackend.entity.ScheduleActivity;

import java.math.BigDecimal;

public record ActivityMatchResult(ScheduleActivity activity, BigDecimal score, String method) {
}
