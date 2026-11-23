package com.clinicflow.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class DoctorRequest {

    @NotBlank(message = "Doctor name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Fee cannot be negative")
    private BigDecimal consultationFee;

    @NotBlank(message = "Available days are required (e.g. MONDAY,WEDNESDAY,FRIDAY)")
    private String availableDays;

    @NotBlank(message = "Available hours are required (e.g. 09:00 - 17:00)")
    private String availableHours;

    private Boolean active;

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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
