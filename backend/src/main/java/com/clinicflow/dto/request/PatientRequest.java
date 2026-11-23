package com.clinicflow.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class PatientRequest {

    @NotBlank(message = "Patient full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be a past date")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+0-9\\-\\s()]{7,20}$", message = "Phone number format is invalid")
    private String phone;

    @NotBlank(message = "Email address is required")
    @Email(message = "Email address must be a valid email format")
    private String email;

    private String address;

    private String emergencyContact;

    private String medicalHistorySummary;

    private Boolean active;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getMedicalHistorySummary() {
        return medicalHistorySummary;
    }

    public void setMedicalHistorySummary(String medicalHistorySummary) {
        this.medicalHistorySummary = medicalHistorySummary;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
