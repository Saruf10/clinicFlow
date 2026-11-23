package com.clinicflow.controller;

import com.clinicflow.dto.request.DoctorRequest;
import com.clinicflow.dto.response.ApiResponse;
import com.clinicflow.dto.response.DoctorResponse;
import com.clinicflow.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctors", description = "Doctor management operations")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    @Operation(summary = "Add a new doctor")
    public ResponseEntity<ApiResponse<DoctorResponse>> addDoctor(@Valid @RequestBody DoctorRequest request) {
        DoctorResponse response = doctorService.addDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Doctor added successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable Long id) {
        DoctorResponse response = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Doctor retrieved successfully"));
    }

    @GetMapping
    @Operation(summary = "List and search doctors with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> getAllDoctors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<DoctorResponse> doctors = doctorService.getAllDoctors(query, specialization, activeOnly, pageRequest);

        return ResponseEntity.ok(ApiResponse.success(doctors, "Doctors retrieved successfully"));
    }

    @GetMapping("/active")
    @Operation(summary = "Get list of all active doctors for dropdowns")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getActiveDoctors() {
        List<DoctorResponse> activeDoctors = doctorService.getActiveDoctors();
        return ResponseEntity.ok(ApiResponse.success(activeDoctors, "Active doctors retrieved successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update doctor details")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request) {
        DoctorResponse response = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Doctor updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate doctor")
    public ResponseEntity<ApiResponse<Void>> deactivateDoctor(@PathVariable Long id) {
        doctorService.deactivateDoctor(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Doctor deactivated successfully"));
    }
}
