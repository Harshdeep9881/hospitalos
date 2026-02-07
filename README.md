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
  name VARCHAR(255),
  age INT,
  gender VARCHAR(20),
  phone VARCHAR(50)
);

CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  department VARCHAR(255)
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id INT,
  appointment_date DATE,
  appointment_time TIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
```

### Docker (optional)
Run MySQL + backend:
```
docker-compose up --build
```
