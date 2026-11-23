package com.clinicflow.controller;

import com.clinicflow.dto.request.AppointmentRequest;
import com.clinicflow.dto.request.RescheduleRequest;
import com.clinicflow.dto.response.ApiResponse;
import com.clinicflow.dto.response.AppointmentResponse;
import com.clinicflow.entity.AppointmentStatus;
import com.clinicflow.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Appointment scheduling and lifecycle management")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @Operation(summary = "Book an appointment with conflict checking")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Appointment booked successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse response = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment retrieved successfully"));
    }

    @GetMapping
    @Operation(summary = "List appointments with multifaceted filtering")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getAppointments(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<AppointmentResponse> appointments = appointmentService.getAppointments(doctorId, patientId, status, dateFrom, dateTo, pageRequest);

        return ResponseEntity.ok(ApiResponse.success(appointments, "Appointments retrieved successfully"));
    }

    @PutMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule an existing appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {
        AppointmentResponse response = appointmentService.rescheduleAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment rescheduled successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        AppointmentResponse response = appointmentService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment status updated to " + status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Appointment cancelled successfully"));
    }

    @GetMapping("/doctor/{doctorId}/date")
    @Operation(summary = "Get appointments for a specific doctor on a given date")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentResponse> list = appointmentService.getAppointmentsByDoctorAndDate(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success(list, "Doctor appointments retrieved"));
    }
}
