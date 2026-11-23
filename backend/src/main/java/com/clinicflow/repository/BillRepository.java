package com.clinicflow.repository;

import com.clinicflow.entity.Bill;
import com.clinicflow.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    @Query("SELECT b FROM Bill b " +
           "JOIN FETCH b.patient " +
           "JOIN FETCH b.doctor " +
           "JOIN FETCH b.appointment " +
           "WHERE (:patientId IS NULL OR b.patient.id = :patientId) " +
           "AND (:status IS NULL OR b.paymentStatus = :status)")
    Page<Bill> findFilteredBills(
            @Param("patientId") Long patientId,
            @Param("status") PaymentStatus status,
            Pageable pageable);

    List<Bill> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.paymentStatus = 'PAID'")
    BigDecimal calculateTotalPaidRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.paymentStatus = 'PAID' AND b.paidAt >= :since")
    BigDecimal calculateRevenueSince(@Param("since") LocalDateTime since);

    @Query("SELECT FUNCTION('DATE_TRUNC', 'month', b.paidAt) as m, COALESCE(SUM(b.totalAmount), 0) " +
           "FROM Bill b WHERE b.paymentStatus = 'PAID' AND b.paidAt IS NOT NULL " +
           "GROUP BY FUNCTION('DATE_TRUNC', 'month', b.paidAt) " +
           "ORDER BY m ASC")
    List<Object[]> calculateMonthlyRevenue();
}
