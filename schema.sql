-- ==============================================================================
-- ClinicFlow Database Schema (PostgreSQL / Supabase DDL)
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT,
    emergency_contact VARCHAR(100),
    medical_history_summary TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_patient_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patient_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patient_name ON patients(full_name);

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    consultation_fee NUMERIC(10, 2) NOT NULL,
    available_days VARCHAR(150) NOT NULL,
    available_hours VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctor_name ON doctors(name);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason_for_visit VARCHAR(200) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_appt_doc_date ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appt_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appt_status ON appointments(status);

-- 5. Bills Table
CREATE TABLE IF NOT EXISTS bills (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    consultation_fee NUMERIC(10, 2) NOT NULL,
    additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_bill_patient ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bill_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_created ON bills(created_at);
