CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  visit_date DATE NOT NULL,
  diagnosis VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_medical_records_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_medical_records_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_medical_records_patient_date (patient_id, visit_date),
  INDEX idx_medical_records_doctor_date (doctor_id, visit_date),
  INDEX idx_medical_records_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
