package com.clinicflow.repository;

import com.clinicflow.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("SELECT p FROM Patient p WHERE " +
           "(:query IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "p.phone LIKE CONCAT('%', :query, '%')) AND " +
           "(:activeOnly IS NULL OR p.active = :activeOnly)")
    Page<Patient> searchPatients(@Param("query") String query,
                                @Param("activeOnly") Boolean activeOnly,
                                Pageable pageable);

    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    long countByActiveTrue();
}
