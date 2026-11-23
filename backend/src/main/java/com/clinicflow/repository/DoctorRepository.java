package com.clinicflow.repository;

import com.clinicflow.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("SELECT d FROM Doctor d WHERE " +
           "(:query IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:specialization IS NULL OR LOWER(d.specialization) = LOWER(:specialization)) AND " +
           "(:activeOnly IS NULL OR d.active = :activeOnly)")
    Page<Doctor> searchDoctors(@Param("query") String query,
                               @Param("specialization") String specialization,
                               @Param("activeOnly") Boolean activeOnly,
                               Pageable pageable);

    List<Doctor> findByActiveTrue();
    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);

    long countByActiveTrue();
}
