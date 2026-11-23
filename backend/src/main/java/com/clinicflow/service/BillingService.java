package com.clinicflow.service;

import com.clinicflow.dto.request.BillRequest;
import com.clinicflow.dto.request.PaymentStatusRequest;
import com.clinicflow.dto.response.BillResponse;
import com.clinicflow.dto.response.DashboardStatsResponse;
import com.clinicflow.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface BillingService {
    BillResponse generateBill(BillRequest request);
    BillResponse getBillById(Long id);
    BillResponse getBillByAppointmentId(Long appointmentId);
    Page<BillResponse> getBills(Long patientId, PaymentStatus status, Pageable pageable);
    List<BillResponse> getPatientBillingHistory(Long patientId);
    BillResponse updatePaymentStatus(Long id, PaymentStatusRequest request);
    DashboardStatsResponse getDashboardStats();
    Map<String, BigDecimal> getRevenueStats();
}
