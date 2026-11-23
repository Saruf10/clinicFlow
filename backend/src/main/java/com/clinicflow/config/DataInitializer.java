package com.clinicflow.config;

import com.clinicflow.entity.*;
import com.clinicflow.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            BillRepository billRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin and Staff Users if not present
            if (userRepository.count() == 0) {
                User admin = new User("admin", passwordEncoder.encode("admin123"), "Dr. Sarah Jenkins (Admin)", "admin@clinicflow.io", Role.ADMIN);
                User receptionist = new User("receptionist", passwordEncoder.encode("recep123"), "Alex Rivera (Receptionist)", "alex@clinicflow.io", Role.RECEPTIONIST);
                User doctorUser = new User("doctor", passwordEncoder.encode("doc123"), "Dr. Marcus Chen", "m.chen@clinicflow.io", Role.DOCTOR);
                userRepository.save(admin);
                userRepository.save(receptionist);
                userRepository.save(doctorUser);
            }

            // Seed Doctors if not present
            if (doctorRepository.count() == 0) {
                Doctor d1 = new Doctor("Dr. Marcus Chen", "Cardiology", "+1-555-0101", "m.chen@clinicflow.io",
                        new BigDecimal("150.00"), "MONDAY,TUESDAY,WEDNESDAY,THURSDAY", "09:00 - 17:00");
                Doctor d2 = new Doctor("Dr. Emily Watson", "Dermatology", "+1-555-0102", "e.watson@clinicflow.io",
                        new BigDecimal("120.00"), "MONDAY,WEDNESDAY,FRIDAY", "10:00 - 16:00");
                Doctor d3 = new Doctor("Dr. James Patel", "Pediatrics", "+1-555-0103", "j.patel@clinicflow.io",
                        new BigDecimal("100.00"), "TUESDAY,THURSDAY,SATURDAY", "08:30 - 15:30");
                Doctor d4 = new Doctor("Dr. Olivia Brooks", "Orthopedics", "+1-555-0104", "o.brooks@clinicflow.io",
                        new BigDecimal("180.00"), "MONDAY,TUESDAY,FRIDAY", "09:00 - 18:00");

                doctorRepository.save(d1);
                doctorRepository.save(d2);
                doctorRepository.save(d3);
                doctorRepository.save(d4);
            }

            // Seed Patients if not present
            if (patientRepository.count() == 0) {
                Patient p1 = new Patient("Robert Downey", LocalDate.of(1985, 4, 12), "Male", "+1-555-1001",
                        "robert.d@example.com", "10880 Malibu Point, CA", "+1-555-9001 (Pepper)", "Hypertension, mild asthma");
                Patient p2 = new Patient("Clara Oswald", LocalDate.of(1992, 11, 23), "Female", "+1-555-1002",
                        "clara.o@example.com", "42 Coal Hill Lane, London", "+1-555-9002 (Danny)", "No known allergies");
                Patient p3 = new Patient("Arthur Dent", LocalDate.of(1978, 3, 11), "Male", "+1-555-1003",
                        "arthur.dent@example.com", "155 Country Lane, Cottington", "+1-555-9003 (Ford)", "Chronic lower back stiffness");
                Patient p4 = new Patient("Eleanor Vance", LocalDate.of(1998, 7, 19), "Female", "+1-555-1004",
                        "eleanor.v@example.com", "770 Elm Street, Boston, MA", "+1-555-9004 (Luke)", "Eczema, penicillin allergy");

                patientRepository.save(p1);
                patientRepository.save(p2);
                patientRepository.save(p3);
                patientRepository.save(p4);
            }

            // Seed Appointments & Bills
            if (appointmentRepository.count() == 0) {
                Patient p1 = patientRepository.findAll().get(0);
                Patient p2 = patientRepository.findAll().get(1);
                Patient p3 = patientRepository.findAll().get(2);
                Patient p4 = patientRepository.findAll().get(3);

                Doctor d1 = doctorRepository.findAll().get(0);
                Doctor d2 = doctorRepository.findAll().get(1);
                Doctor d3 = doctorRepository.findAll().get(2);

                // Past Completed Appointment with Paid Bill
                Appointment a1 = new Appointment(p1, d1, LocalDate.now().minusDays(2),
                        LocalTime.of(10, 0), LocalTime.of(10, 30),
                        "Routine Cardiac Checkup", "Patient reports mild chest heaviness during exercise. ECG normal.",
                        AppointmentStatus.COMPLETED);
                appointmentRepository.save(a1);

                Bill b1 = new Bill(a1, p1, d1, d1.getConsultationFee(), new BigDecimal("35.00"),
                        BigDecimal.ZERO, d1.getConsultationFee().add(new BigDecimal("35.00")),
                        PaymentStatus.PAID, "CREDIT_CARD");
                b1.setPaidAt(java.time.LocalDateTime.now().minusDays(2));
                billRepository.save(b1);

                // Completed Appointment with Pending Bill
                Appointment a2 = new Appointment(p2, d2, LocalDate.now().minusDays(1),
                        LocalTime.of(14, 0), LocalTime.of(14, 45),
                        "Skin Rash Assessment", "Prescribed topical corticosteroid for contact dermatitis.",
                        AppointmentStatus.COMPLETED);
                appointmentRepository.save(a2);

                Bill b2 = new Bill(a2, p2, d2, d2.getConsultationFee(), BigDecimal.ZERO,
                        new BigDecimal("10.00"), d2.getConsultationFee().subtract(new BigDecimal("10.00")),
                        PaymentStatus.PENDING, null);
                billRepository.save(b2);

                // Today's Upcoming Booked Appointment
                Appointment a3 = new Appointment(p3, d3, LocalDate.now(),
                        LocalTime.of(15, 0), LocalTime.of(15, 30),
                        "Child Wellness & Immunization Consultation", "Parent requests booster shot review.",
                        AppointmentStatus.CONFIRMED);
                appointmentRepository.save(a3);

                // Future Booked Appointment
                Appointment a4 = new Appointment(p4, d1, LocalDate.now().plusDays(2),
                        LocalTime.of(11, 0), LocalTime.of(11, 30),
                        "Pre-Operative Clearance", "Surgical clearance evaluation.",
                        AppointmentStatus.BOOKED);
                appointmentRepository.save(a4);

                // Cancelled Appointment
                Appointment a5 = new Appointment(p1, d2, LocalDate.now().plusDays(1),
                        LocalTime.of(16, 0), LocalTime.of(16, 30),
                        "Mole Examination", "Cancelled by patient due to work schedule conflict.",
                        AppointmentStatus.CANCELLED);
                appointmentRepository.save(a5);
            }
        };
    }
}
