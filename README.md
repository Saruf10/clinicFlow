# ClinicFlow: Clinic Management & Appointment System

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![React](https://img.shields.io/badge/React-19_TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**ClinicFlow** is an enterprise-grade clinic management and outpatient appointment system engineered specifically as a portfolio-quality demonstration of senior backend design principles, database architecture, and full-stack software craftsmanship.

---

## Architecture Overview

ClinicFlow implements a **strict layered architecture** separating transport, business invariants, and persistence concerns:

```
┌────────────────────────────────────────────────────────┐
│            React + TypeScript + Tailwind UI            │
│       (Dashboard, Appointments, Patients, Bills)       │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (JWT Auth)
┌───────────────────────────▼────────────────────────────┐
│                    Controller Layer                    │
│   (AuthController, PatientController, Appointment...)  │
└───────────────────────────▲────────────────────────────┘
                            │ DTO Mapping / Input Validation
┌───────────────────────────▼────────────────────────────┐
│                     Service Layer                      │
│ (Conflict Detection, Slot Verification, Revenue Logic) │
└───────────────────────────▲────────────────────────────┘
                            │ Spring Data JPA / Hibernate
┌───────────────────────────▼────────────────────────────┐
│                   Repository Layer                     │
│    (Custom JPQL Queries, Indexing, Transaction Mgmt)   │
└───────────────────────────▲────────────────────────────┘
                            │ JDBC Connection Pool (HikariCP)
┌───────────────────────────▼────────────────────────────┐
│         PostgreSQL Database (Supabase / Local)         │
│     (Relational Schemas, Constraints, Foreign Keys)    │
└────────────────────────────────────────────────────────┘
```

---

## Core Features & Real-World Business Logic

### 1. Patient Electronic Health Records (EHR)
- Complete patient lifecycle: registration, profile modifications, emergency contacts, medical history annotations, and soft-deactivation.
- Multifaceted search by patient name, phone number, and email.
- Pagination and sorting on all read collections.

### 2. Medical Specialist & Doctor Management
- Specialization taxonomy (Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology, General Medicine).
- Configurable consultation rates, available working days, and consultation windows.
- Active doctor registry for real-time appointment dispatch.

### 3. Concurrency-Safe Appointment Scheduling & Conflict Detection
- **Double Booking Prevention**: An algorithm in JPQL detects doctor calendar overlaps:
  $$\text{Overlap} \iff (\text{start}_{\text{candidate}} < \text{end}_{\text{existing}}) \land (\text{end}_{\text{candidate}} > \text{start}_{\text{existing}})$$
- **Temporal Invariant Protection**: Rejects bookings in the past or invalid times where start time $\ge$ end time.
- **Entity State Validation**: Validates that both doctor and patient exist and are active.
- **Rescheduling & Status Transition Machine**: Safely transitions appointments across `BOOKED` $\to$ `CONFIRMED` $\to$ `COMPLETED` / `CANCELLED` / `NO_SHOW`.

### 4. Billing, Invoicing & Settlement
- Automatic bill generation linked directly to completed consultations.
- Calculation of consultation fee, lab/additional charges, and discounts.
- Prevents duplicate invoicing for the same appointment via JPA database unique constraints.
- Settlement recording (`PENDING` $\to$ `PAID`) with payment methods (Credit Card, Cash, UPI, Insurance).

### 5. Clinical Operations Dashboard
- Live operational cards: Total patients, active doctors, today's schedule, upcoming sessions, cancellations, pending invoices, and total collected revenue.
- Interactive status distribution pie chart and operational volume chart (Recharts).

---

## Database Design & ER Relationships

- **`users`**: System credentials, BCrypt hashed passwords, role (`ADMIN`, `RECEPTIONIST`, `DOCTOR`).
- **`patients`**: Demographics, contacts, indexed on `email`, `phone`, and `fullName`.
- **`doctors`**: Specialization, consultation rates, availability parameters.
- **`appointments`**: Many-to-One to `patients` and `doctors`, indexed on `(doctor_id, appointmentDate)` and `status`.
- **`bills`**: One-to-One with `appointments`, Many-to-One to `patients` and `doctors`.

---

## Security & Authentication

- Stateless **JWT (JSON Web Token)** authentication via `JwtAuthenticationFilter`.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full authority over doctors, patients, appointments, billing, and system users.
  - `RECEPTIONIST`: Patient intake, appointment booking, rescheduling, and invoice collection.
  - `DOCTOR`: View assigned patients, appointments, and medical notes.
- Passwords hashed using industry-standard **BCrypt**.

---

## Supabase PostgreSQL Setup & Environment Variables

ClinicFlow uses environment variables so secrets are never hardcoded.

1. Create a project at [Supabase](https://supabase.com/).
2. In your Supabase Project Settings, copy the **Transaction Pooler** or **Direct** PostgreSQL connection string.
3. Configure your local `.env` or set environment variables before running:

```bash
# Example .env or Environment Variables
PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.<your-project-ref>
SPRING_DATASOURCE_PASSWORD=your_secure_supabase_password
SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO=update

JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B59703645
JWT_EXPIRATION_MS=86400000
```

> **Zero-Config Local Fallback**: If Supabase credentials are not supplied, ClinicFlow boots into an embedded **PostgreSQL-mode in-memory H2 database** with realistic seed demo data.

---

## How to Run

### Running Backend (Spring Boot)

```bash
# From the project root
cd backend
mvn clean spring-boot:run
```

The REST API will boot on `http://localhost:8080`.
- **Swagger / OpenAPI Documentation**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema**: `http://localhost:8080/v3/api-docs`

### Running Frontend (React + Vite)

```bash
# From the project root
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## Demo Credentials

The database seeds with demo credentials:

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Receptionist** | `receptionist` | `recep123` |
| **Doctor** | `doctor` | `doc123` |

---

## Automated Tests

ClinicFlow contains a JUnit 5 & Mockito test suite covering:
1. `PatientServiceTest`:
   - Valid patient creation and DTO mapping.
   - Duplicate email rejection (`ConflictException`).
   - Resource not found handling.
2. `AppointmentServiceTest`:
   - Valid slot booking.
   - Double-booking overlap rejection (`ConflictException`).
   - Past-date scheduling rejection (`BadRequestException`).
   - Inactive patient / doctor rejection.
   - Lifecycle cancellation.
3. `BillingServiceTest`:
   - Invoice calculation with consultation fees and discounts.
   - Duplicate billing prevention for the same appointment.
   - Payment collection and settlement timestamps.

To run the test suite:
```bash
cd backend
mvn test
```
**Results**: 12/12 passing tests, 0 failures, 0 errors.

---

## Campus Placement Interview Cheatsheet

### 1. Object-Oriented Principles
- **Encapsulation**: Private fields in entities and DTOs with controlled accessors.
- **Abstraction**: `PatientService`, `DoctorService`, `AppointmentService`, `BillingService` interfaces isolate business contracts from persistence details.
- **Polymorphism**: `GlobalExceptionHandler` with `@ExceptionHandler` handling polymorphic exceptions.

### 2. Spring Boot & Dependency Injection
- Constructor-based dependency injection is used across all components for testability and immutability.
- Separation of concerns between `@RestController`, `@Service`, and `@Repository`.

### 3. Concurrency & Transactions
- `@Transactional(isolation = Isolation.READ_COMMITTED)` prevents dirty reads during slot booking and status transitions.
- Conflict detection handles overlapping intervals directly in SQL/JPQL before persisting to avoid race conditions.

### 4. Spring Security & JWT
- Stateless JWT filter parses Authorization headers and establishes `SecurityContext` without server session state.
- BCrypt hashing protects stored credentials against dictionary attacks.
