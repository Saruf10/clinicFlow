package com.clinicflow.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors", indexes = {
    @Index(name = "idx_doctor_specialization", columnList = "specialization"),
    @Index(name = "idx_doctor_email", columnList = "email"),
    @Index(name = "idx_doctor_name", columnList = "name")
})
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee;

    // Available days e.g. "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY"
    @Column(nullable = false, length = 150)
    private String availableDays;

    // Available hours e.g. "09:00 - 17:00"
    @Column(nullable = false, length = 50)
    private String availableHours;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Doctor() {
    }

    public Doctor(String name, String specialization, String phone, String email,
                  BigDecimal consultationFee, String availableDays, String availableHours) {
        this.name = name;
        this.specialization = specialization;
        this.phone = phone;
        this.email = email;
        this.consultationFee = consultationFee;
        this.availableDays = availableDays;
        this.availableHours = availableHours;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getAvailableDays() {
        return availableDays;
    }

    public void setAvailableDays(String availableDays) {
        this.availableDays = availableDays;
    }

    public String getAvailableHours() {
        return availableHours;
    }

    public void setAvailableHours(String availableHours) {
        this.availableHours = availableHours;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
