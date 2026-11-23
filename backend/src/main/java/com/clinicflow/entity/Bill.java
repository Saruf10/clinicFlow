package com.clinicflow.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills", uniqueConstraints = {
    @UniqueConstraint(name = "uk_bill_appointment", columnNames = "appointment_id")
}, indexes = {
    @Index(name = "idx_bill_patient", columnList = "patient_id"),
    @Index(name = "idx_bill_status", columnList = "paymentStatus"),
    @Index(name = "idx_bill_created", columnList = "createdAt")
})
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal additionalCharges = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(length = 50)
    private String paymentMethod; // e.g. "CASH", "CREDIT_CARD", "INSURANCE", "UPI"

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    public Bill() {
    }

    public Bill(Appointment appointment, Patient patient, Doctor doctor,
                BigDecimal consultationFee, BigDecimal additionalCharges, BigDecimal discount,
                BigDecimal totalAmount, PaymentStatus paymentStatus, String paymentMethod) {
        this.appointment = appointment;
        this.patient = patient;
        this.doctor = doctor;
        this.consultationFee = consultationFee;
        this.additionalCharges = additionalCharges != null ? additionalCharges : BigDecimal.ZERO;
        this.discount = discount != null ? discount : BigDecimal.ZERO;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
