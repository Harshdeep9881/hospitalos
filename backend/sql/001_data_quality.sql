-- Data quality + performance for MariaDB/MySQL
-- Note: Verify foreign key names if your database auto-generated different names.

-- Tighten column constraints
ALTER TABLE patients
  MODIFY name VARCHAR(100) NOT NULL,
  MODIFY age SMALLINT UNSIGNED NOT NULL,
  MODIFY gender VARCHAR(20) NOT NULL,
  MODIFY phone VARCHAR(25) NOT NULL,
  ADD CONSTRAINT chk_patients_name_len CHECK (CHAR_LENGTH(name) >= 2),
  ADD CONSTRAINT chk_patients_age_range CHECK (age BETWEEN 0 AND 120),
  ADD CONSTRAINT chk_patients_phone_len CHECK (CHAR_LENGTH(phone) >= 7);

ALTER TABLE doctors
  MODIFY name VARCHAR(100) NOT NULL,
  MODIFY department VARCHAR(100) NOT NULL,
  ADD CONSTRAINT chk_doctors_name_len CHECK (CHAR_LENGTH(name) >= 2),
  ADD CONSTRAINT chk_doctors_department_len CHECK (CHAR_LENGTH(department) >= 2);

ALTER TABLE appointments
  MODIFY patient_id INT NOT NULL,
  MODIFY doctor_id INT NOT NULL,
  MODIFY appointment_date DATE NOT NULL,
  MODIFY appointment_time TIME NOT NULL;

-- Foreign keys with explicit ON DELETE/ON UPDATE policies
-- If these fail, list existing keys with:
--   SHOW CREATE TABLE appointments;
-- and update the DROP FOREIGN KEY names below.
ALTER TABLE appointments
  DROP FOREIGN KEY appointments_ibfk_1,
  DROP FOREIGN KEY appointments_ibfk_2;

ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes for common queries
CREATE INDEX idx_appointments_date ON appointments (appointment_date);
CREATE INDEX idx_appointments_doctor_date ON appointments (doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date);
