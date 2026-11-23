package com.clinicflow.service;

import com.clinicflow.dto.request.PatientRequest;
import com.clinicflow.dto.response.PatientResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {
    PatientResponse registerPatient(PatientRequest request);
    PatientResponse getPatientById(Long id);
    Page<PatientResponse> getAllPatients(String query, Boolean activeOnly, Pageable pageable);
    PatientResponse updatePatient(Long id, PatientRequest request);
    void deactivatePatient(Long id);
}
