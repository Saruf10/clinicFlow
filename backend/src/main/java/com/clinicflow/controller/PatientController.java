package com.clinicflow.controller;

import com.clinicflow.dto.request.PatientRequest;
import com.clinicflow.dto.response.ApiResponse;
import com.clinicflow.dto.response.PatientResponse;
import com.clinicflow.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patients", description = "Patient management operations")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    @Operation(summary = "Register a new patient")
    public ResponseEntity<ApiResponse<PatientResponse>> registerPatient(@Valid @RequestBody PatientRequest request) {
        PatientResponse response = patientService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Patient registered successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(@PathVariable Long id) {
        PatientResponse response = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Patient retrieved successfully"));
    }

    @GetMapping
    @Operation(summary = "List and search patients with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> getAllPatients(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<PatientResponse> patients = patientService.getAllPatients(query, activeOnly, pageRequest);

        return ResponseEntity.ok(ApiResponse.success(patients, "Patients retrieved successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing patient")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request) {
        PatientResponse response = patientService.updatePatient(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Patient updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate patient")
    public ResponseEntity<ApiResponse<Void>> deactivatePatient(@PathVariable Long id) {
        patientService.deactivatePatient(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient deactivated successfully"));
    }
}
