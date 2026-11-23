package com.clinicflow.service.impl;

import com.clinicflow.dto.request.DoctorRequest;
import com.clinicflow.dto.response.DoctorResponse;
import com.clinicflow.entity.Doctor;
import com.clinicflow.exception.ConflictException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.mapper.EntityDtoMapper;
import com.clinicflow.repository.DoctorRepository;
import com.clinicflow.service.DoctorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final EntityDtoMapper mapper;

    public DoctorServiceImpl(DoctorRepository doctorRepository, EntityDtoMapper mapper) {
        this.doctorRepository = doctorRepository;
        this.mapper = mapper;
    }

    @Override
    public DoctorResponse addDoctor(DoctorRequest request) {
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Doctor with email " + request.getEmail() + " already exists");
        }

        Doctor doctor = new Doctor(
                request.getName(),
                request.getSpecialization(),
                request.getPhone(),
                request.getEmail(),
                request.getConsultationFee(),
                request.getAvailableDays(),
                request.getAvailableHours()
        );

        Doctor saved = doctorRepository.save(doctor);
        return mapper.toDoctorResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
        return mapper.toDoctorResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getAllDoctors(String query, String specialization, Boolean activeOnly, Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cleanSpec = (specialization != null && !specialization.trim().isEmpty()) ? specialization.trim() : null;
        return doctorRepository.searchDoctors(cleanQuery, cleanSpec, activeOnly, pageable)
                .map(mapper::toDoctorResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> getActiveDoctors() {
        return doctorRepository.findByActiveTrue().stream()
                .map(mapper::toDoctorResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorResponse updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));

        doctorRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("Another doctor already uses email: " + request.getEmail());
            }
        });

        mapper.updateDoctorEntity(doctor, request);
        Doctor updated = doctorRepository.save(doctor);
        return mapper.toDoctorResponse(updated);
    }

    @Override
    public void deactivateDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
        doctor.setActive(false);
        doctorRepository.save(doctor);
    }
}
