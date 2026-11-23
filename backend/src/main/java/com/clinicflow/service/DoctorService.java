package com.clinicflow.service;

import com.clinicflow.dto.request.DoctorRequest;
import com.clinicflow.dto.response.DoctorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DoctorService {
    DoctorResponse addDoctor(DoctorRequest request);
    DoctorResponse getDoctorById(Long id);
    Page<DoctorResponse> getAllDoctors(String query, String specialization, Boolean activeOnly, Pageable pageable);
    List<DoctorResponse> getActiveDoctors();
    DoctorResponse updateDoctor(Long id, DoctorRequest request);
    void deactivateDoctor(Long id);
}
