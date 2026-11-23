package com.clinicflow.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class RescheduleRequest {
    @NotNull(message = "New appointment date is required")
    private LocalDate appointmentDate;

    @NotNull(message = "New start time is required")
    private LocalTime startTime;

    @NotNull(message = "New end time is required")
    private LocalTime endTime;

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}
