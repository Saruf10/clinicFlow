package com.clinicflow.service;

import com.clinicflow.dto.request.PatientRequest;
import com.clinicflow.dto.response.PatientResponse;
import com.clinicflow.entity.Patient;
import com.clinicflow.exception.ConflictException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.mapper.EntityDtoMapper;
import com.clinicflow.repository.PatientRepository;
import com.clinicflow.service.impl.PatientServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private PatientServiceImpl patientService;

    private PatientRequest patientRequest;
    private Patient patient;
    private PatientResponse patientResponse;

    @BeforeEach
    void setUp() {
        patientRequest = new PatientRequest();
        patientRequest.setFullName("John Doe");
        patientRequest.setEmail("john.doe@example.com");
        patientRequest.setPhone("+1-555-0001");
        patientRequest.setDateOfBirth(LocalDate.of(1990, 1, 1));
        patientRequest.setGender("Male");

        patient = new Patient("John Doe", LocalDate.of(1990, 1, 1), "Male", "+1-555-0001",
                "john.doe@example.com", "123 Street", "Jane Doe", "None");
        patient.setId(1L);

        patientResponse = new PatientResponse();
        patientResponse.setId(1L);
        patientResponse.setFullName("John Doe");
        patientResponse.setEmail("john.doe@example.com");
    }

    @Test
    @DisplayName("Successful patient registration returns DTO")
    void registerPatient_Success() {
        when(patientRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(patientRepository.existsByPhone("+1-555-0001")).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);
        when(mapper.toPatientResponse(patient)).thenReturn(patientResponse);

        PatientResponse result = patientService.registerPatient(patientRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John Doe", result.getFullName());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    @DisplayName("Duplicate email throws ConflictException")
    void registerPatient_DuplicateEmail_ThrowsConflict() {
        when(patientRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> patientService.registerPatient(patientRequest));
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    @DisplayName("Patient not found by ID throws ResourceNotFoundException")
    void getPatientById_NotFound_ThrowsException() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> patientService.getPatientById(999L));
    }
}
