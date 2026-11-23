package com.clinicflow.repository;

import com.clinicflow.entity.Appointment;
import com.clinicflow.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Conflict detection: Checks whether a doctor already has an active overlapping appointment.
     * Active means status is NOT CANCELLED and NOT NO_SHOW.
     * Overlap condition:
     * (candidateStartTime < existingEndTime) AND (candidateEndTime > existingStartTime)
     */
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND (:excludeId IS NULL OR a.id != :excludeId) " +
           "AND (:startTime < a.endTime AND :endTime > a.startTime)")
    boolean existsOverlappingAppointment(
            @Param("doctorId") Long doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId);

    @Query("SELECT a FROM Appointment a " +
           "JOIN FETCH a.patient " +
           "JOIN FETCH a.doctor " +
           "WHERE (:doctorId IS NULL OR a.doctor.id = :doctorId) " +
           "AND (:patientId IS NULL OR a.patient.id = :patientId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:dateFrom IS NULL OR a.appointmentDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR a.appointmentDate <= :dateTo)")
    Page<Appointment> findFilteredAppointments(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("status") AppointmentStatus status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    long countByAppointmentDate(LocalDate appointmentDate);

    long countByAppointmentDateGreaterThanEqualAndStatus(LocalDate date, AppointmentStatus status);

    long countByStatus(AppointmentStatus status);

    @Query("SELECT a.status, COUNT(a) FROM Appointment a GROUP BY a.status")
    List<Object[]> countAppointmentsByStatus();
}
