package com.clinicflow.service.impl;

import com.clinicflow.dto.request.BillRequest;
import com.clinicflow.dto.request.PaymentStatusRequest;
import com.clinicflow.dto.response.BillResponse;
import com.clinicflow.dto.response.DashboardStatsResponse;
import com.clinicflow.entity.Appointment;
import com.clinicflow.entity.AppointmentStatus;
import com.clinicflow.entity.Bill;
import com.clinicflow.entity.PaymentStatus;
import com.clinicflow.exception.BadRequestException;
import com.clinicflow.exception.ConflictException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.mapper.EntityDtoMapper;
import com.clinicflow.repository.AppointmentRepository;
import com.clinicflow.repository.BillRepository;
import com.clinicflow.repository.DoctorRepository;
import com.clinicflow.repository.PatientRepository;
import com.clinicflow.service.BillingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillingServiceImpl implements BillingService {

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final EntityDtoMapper mapper;

    public BillingServiceImpl(BillRepository billRepository,
                              AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              EntityDtoMapper mapper) {
        this.billRepository = billRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.mapper = mapper;
    }

    @Override
    public BillResponse generateBill(BillRequest request) {
        // Prevent duplicate billing for the same appointment
        if (billRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new ConflictException("A bill has already been generated for appointment ID: " + request.getAppointmentId());
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + request.getAppointmentId()));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot generate a bill for a cancelled appointment");
        }

        BigDecimal consultationFee = appointment.getDoctor().getConsultationFee();
        BigDecimal addCharges = request.getAdditionalCharges() != null ? request.getAdditionalCharges() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;

        BigDecimal total = consultationFee.add(addCharges).subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        Bill bill = new Bill(
                appointment,
                appointment.getPatient(),
                appointment.getDoctor(),
                consultationFee,
                addCharges,
                discount,
                total,
                PaymentStatus.PENDING,
                request.getPaymentMethod()
        );

        // Mark appointment as COMPLETED upon billing if currently BOOKED or CONFIRMED
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }

        Bill saved = billRepository.save(bill);
        return mapper.toBillResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
        return mapper.toBillResponse(bill);
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse getBillByAppointmentId(Long appointmentId) {
        Bill bill = billRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No bill found for appointment ID: " + appointmentId));
        return mapper.toBillResponse(bill);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BillResponse> getBills(Long patientId, PaymentStatus status, Pageable pageable) {
        return billRepository.findFilteredBills(patientId, status, pageable)
                .map(mapper::toBillResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillResponse> getPatientBillingHistory(Long patientId) {
        return billRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(mapper::toBillResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BillResponse updatePaymentStatus(Long id, PaymentStatusRequest request) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));

        bill.setPaymentStatus(request.getPaymentStatus());
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty()) {
            bill.setPaymentMethod(request.getPaymentMethod());
        }

        if (request.getPaymentStatus() == PaymentStatus.PAID) {
            bill.setPaidAt(LocalDateTime.now());
        }

        Bill updated = billRepository.save(bill);
        return mapper.toBillResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalPatients(patientRepository.countByActiveTrue());
        stats.setTotalDoctors(doctorRepository.countByActiveTrue());
        stats.setTodayAppointments(appointmentRepository.countByAppointmentDate(LocalDate.now()));
        stats.setUpcomingAppointments(appointmentRepository.countByAppointmentDateGreaterThanEqualAndStatus(LocalDate.now(), AppointmentStatus.BOOKED)
                + appointmentRepository.countByAppointmentDateGreaterThanEqualAndStatus(LocalDate.now(), AppointmentStatus.CONFIRMED));
        stats.setCompletedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.setCancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        stats.setPendingPayments(billRepository.countByPaymentStatus(PaymentStatus.PENDING));

        BigDecimal totalRev = billRepository.calculateTotalPaidRevenue();
        stats.setTotalRevenue(totalRev != null ? totalRev : BigDecimal.ZERO);

        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        BigDecimal todayRev = billRepository.calculateRevenueSince(startOfToday);
        stats.setTodayRevenue(todayRev != null ? todayRev : BigDecimal.ZERO);

        Map<String, Long> statusMap = new HashMap<>();
        List<Object[]> statusCounts = appointmentRepository.countAppointmentsByStatus();
        for (Object[] row : statusCounts) {
            statusMap.put(row[0].toString(), (Long) row[1]);
        }
        stats.setAppointmentStatusDistribution(statusMap);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getRevenueStats() {
        Map<String, BigDecimal> rev = new HashMap<>();
        BigDecimal total = billRepository.calculateTotalPaidRevenue();
        rev.put("totalRevenue", total != null ? total : BigDecimal.ZERO);

        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        BigDecimal todayRev = billRepository.calculateRevenueSince(todayStart);
        rev.put("dailyRevenue", todayRev != null ? todayRev : BigDecimal.ZERO);

        LocalDateTime monthStart = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        BigDecimal monthlyRev = billRepository.calculateRevenueSince(monthStart);
        rev.put("monthlyRevenue", monthlyRev != null ? monthlyRev : BigDecimal.ZERO);

        return rev;
    }
}
