package com.clinicflow.service.impl;

import com.clinicflow.dto.request.PatientRequest;
import com.clinicflow.dto.response.PatientResponse;
import com.clinicflow.entity.Patient;
import com.clinicflow.exception.ConflictException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.mapper.EntityDtoMapper;
import com.clinicflow.repository.PatientRepository;
import com.clinicflow.service.PatientService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final EntityDtoMapper mapper;

    public PatientServiceImpl(PatientRepository patientRepository, EntityDtoMapper mapper) {
        this.patientRepository = patientRepository;
        this.mapper = mapper;
    }

    @Override
    public PatientResponse registerPatient(PatientRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Patient with email " + request.getEmail() + " already exists");
        }
        if (patientRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Patient with phone number " + request.getPhone() + " already exists");
        }

        Patient patient = new Patient(
                request.getFullName(),
                request.getDateOfBirth(),
                request.getGender(),
                request.getPhone(),
                request.getEmail(),
                request.getAddress(),
                request.getEmergencyContact(),
                request.getMedicalHistorySummary()
        );

        Patient saved = patientRepository.save(patient);
        return mapper.toPatientResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        return mapper.toPatientResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatients(String query, Boolean activeOnly, Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        return patientRepository.searchPatients(cleanQuery, activeOnly, pageable)
                .map(mapper::toPatientResponse);
    }

    @Override
    public PatientResponse updatePatient(Long id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        // Check unique email conflict with other patients
        patientRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("Another patient already uses email: " + request.getEmail());
            }
        });

        // Check unique phone conflict with other patients
        patientRepository.findByPhone(request.getPhone()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("Another patient already uses phone: " + request.getPhone());
            }
        });

        mapper.updatePatientEntity(patient, request);
        Patient updated = patientRepository.save(patient);
        return mapper.toPatientResponse(updated);
    }

    @Override
    public void deactivatePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        patient.setActive(false);
        patientRepository.save(patient);
    }
}
