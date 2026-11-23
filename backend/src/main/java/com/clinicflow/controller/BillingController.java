package com.clinicflow.controller;

import com.clinicflow.dto.request.BillRequest;
import com.clinicflow.dto.request.PaymentStatusRequest;
import com.clinicflow.dto.response.ApiResponse;
import com.clinicflow.dto.response.BillResponse;
import com.clinicflow.entity.PaymentStatus;
import com.clinicflow.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@Tag(name = "Billing", description = "Billing and invoice management")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    @Operation(summary = "Generate bill for an appointment")
    public ResponseEntity<ApiResponse<BillResponse>> generateBill(@Valid @RequestBody BillRequest request) {
        BillResponse response = billingService.generateBill(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Bill generated successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bill by ID")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@PathVariable Long id) {
        BillResponse response = billingService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Bill retrieved successfully"));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get bill by appointment ID")
    public ResponseEntity<ApiResponse<BillResponse>> getBillByAppointmentId(@PathVariable Long appointmentId) {
        BillResponse response = billingService.getBillByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Bill retrieved successfully"));
    }

    @GetMapping
    @Operation(summary = "Get bills with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<BillResponse>>> getBills(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<BillResponse> bills = billingService.getBills(patientId, status, pageRequest);

        return ResponseEntity.ok(ApiResponse.success(bills, "Bills retrieved successfully"));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get billing history for a patient")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getPatientBillingHistory(@PathVariable Long patientId) {
        List<BillResponse> history = billingService.getPatientBillingHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success(history, "Patient billing history retrieved"));
    }

    @PatchMapping("/{id}/payment")
    @Operation(summary = "Update bill payment status")
    public ResponseEntity<ApiResponse<BillResponse>> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody PaymentStatusRequest request) {
        BillResponse response = billingService.updatePaymentStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment status updated successfully"));
    }
}
