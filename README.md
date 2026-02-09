## HospitalOS

Full-stack hospital management system with:
- `backend/` (Node/Express + MySQL)
- `frontend/` (React + Vite)
- optional Docker setup for MySQL + backend

### Run locally (no Docker)
1) Install MySQL and create the database/tables.
2) Update `backend/.env` with your local MySQL credentials.
3) Start backend:
```
cd backend
npm install
npm start
```
4) Start frontend:
```
cd frontend
npm install
npm run dev
```

### Login (demo)
Email: `admin@hospital.com`
Password: `admin123`

### MySQL schema (quick setup)
```
CREATE DATABASE hospital;
USE hospital;

CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age SMALLINT UNSIGNED NOT NULL,
  gender VARCHAR(20) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  CONSTRAINT chk_patients_name_len CHECK (CHAR_LENGTH(name) >= 2),
  CONSTRAINT chk_patients_age_range CHECK (age BETWEEN 0 AND 120),
  CONSTRAINT chk_patients_phone_len CHECK (CHAR_LENGTH(phone) >= 7)
);

CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  CONSTRAINT chk_doctors_name_len CHECK (CHAR_LENGTH(name) >= 2),
  CONSTRAINT chk_doctors_department_len CHECK (CHAR_LENGTH(department) >= 2)
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_appointments_date (appointment_date),
  INDEX idx_appointments_doctor_date (doctor_id, appointment_date),
  INDEX idx_appointments_patient_date (patient_id, appointment_date)
);
```

### Data quality + performance migration (existing DB)
Run this once on an existing database to add constraints, foreign key policies, and indexes:
```
source backend/sql/001_data_quality.sql
```

### Docker (optional)
Run MySQL + backend:
```
docker-compose up --build
```
