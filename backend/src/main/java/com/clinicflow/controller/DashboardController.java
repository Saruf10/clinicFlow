package com.clinicflow.controller;

import com.clinicflow.dto.response.ApiResponse;
import com.clinicflow.dto.response.DashboardStatsResponse;
import com.clinicflow.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Real-time clinic metrics and analytics")
public class DashboardController {

    private final BillingService billingService;

    public DashboardController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get real-time operational statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        DashboardStatsResponse stats = billingService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics retrieved successfully"));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue breakdowns (total, daily, monthly)")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getRevenue() {
        Map<String, BigDecimal> revenue = billingService.getRevenueStats();
        return ResponseEntity.ok(ApiResponse.success(revenue, "Revenue metrics retrieved successfully"));
    }
}
