package com.clinicflow.service;

import com.clinicflow.dto.request.BillRequest;
import com.clinicflow.dto.request.PaymentStatusRequest;
import com.clinicflow.dto.response.BillResponse;
import com.clinicflow.entity.*;
import com.clinicflow.exception.ConflictException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.mapper.EntityDtoMapper;
import com.clinicflow.repository.AppointmentRepository;
import com.clinicflow.repository.BillRepository;
import com.clinicflow.repository.DoctorRepository;
import com.clinicflow.repository.PatientRepository;
import com.clinicflow.service.impl.BillingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private BillingServiceImpl billingService;

    private Appointment appointment;
    private Patient patient;
    private Doctor doctor;
    private BillRequest billRequest;

    @BeforeEach
    void setUp() {
        patient = new Patient("Robert", LocalDate.of(1980, 2, 2), "Male", "+1-555-9999",
                "robert@example.com", "Address", "Contact", "None");
        patient.setId(1L);

        doctor = new Doctor("Dr. Brooks", "Orthopedics", "+1-555-8888", "brooks@clinicflow.io",
                new BigDecimal("150.00"), "MONDAY", "09:00 - 17:00");
        doctor.setId(2L);

        appointment = new Appointment(patient, doctor, LocalDate.now(), LocalTime.of(14, 0), LocalTime.of(14, 30),
                "Consultation", null, AppointmentStatus.BOOKED);
        appointment.setId(10L);

        billRequest = new BillRequest();
        billRequest.setAppointmentId(10L);
        billRequest.setAdditionalCharges(new BigDecimal("25.00"));
        billRequest.setDiscount(new BigDecimal("10.00"));
        billRequest.setPaymentMethod("CASH");
    }

    @Test
    @DisplayName("Generate bill computes total and sets status to PENDING")
    void generateBill_Success() {
        when(billRepository.existsByAppointmentId(10L)).thenReturn(false);
        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(appointment));

        Bill bill = new Bill(appointment, patient, doctor, doctor.getConsultationFee(),
                new BigDecimal("25.00"), new BigDecimal("10.00"), new BigDecimal("165.00"),
                PaymentStatus.PENDING, "CASH");
        bill.setId(500L);

        BillResponse response = new BillResponse();
        response.setId(500L);
        response.setTotalAmount(new BigDecimal("165.00"));
        response.setPaymentStatus(PaymentStatus.PENDING);

        when(billRepository.save(any(Bill.class))).thenReturn(bill);
        when(mapper.toBillResponse(bill)).thenReturn(response);

        BillResponse result = billingService.generateBill(billRequest);

        assertNotNull(result);
        assertEquals(new BigDecimal("165.00"), result.getTotalAmount());
        assertEquals(PaymentStatus.PENDING, result.getPaymentStatus());
        assertEquals(AppointmentStatus.COMPLETED, appointment.getStatus());
        verify(billRepository, times(1)).save(any(Bill.class));
    }

    @Test
    @DisplayName("Duplicate bill generation for same appointment is rejected")
    void generateBill_Duplicate_ThrowsConflict() {
        when(billRepository.existsByAppointmentId(10L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> billingService.generateBill(billRequest));
        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    @DisplayName("Payment update changes status to PAID and sets paid timestamp")
    void updatePaymentStatus_Paid_Success() {
        Bill bill = new Bill(appointment, patient, doctor, doctor.getConsultationFee(),
                BigDecimal.ZERO, BigDecimal.ZERO, doctor.getConsultationFee(),
                PaymentStatus.PENDING, null);
        bill.setId(500L);

        when(billRepository.findById(500L)).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BillResponse response = new BillResponse();
        response.setId(500L);
        response.setPaymentStatus(PaymentStatus.PAID);
        when(mapper.toBillResponse(any(Bill.class))).thenReturn(response);

        PaymentStatusRequest payReq = new PaymentStatusRequest();
        payReq.setPaymentStatus(PaymentStatus.PAID);
        payReq.setPaymentMethod("CREDIT_CARD");

        BillResponse result = billingService.updatePaymentStatus(500L, payReq);

        assertNotNull(result);
        assertEquals(PaymentStatus.PAID, result.getPaymentStatus());
        assertNotNull(bill.getPaidAt());
        assertEquals("CREDIT_CARD", bill.getPaymentMethod());
    }
}
