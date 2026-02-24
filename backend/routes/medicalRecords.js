const express = require("express");
const router = express.Router();
const db = require("../config/db");

const createMedicalRecordsTableSql = `
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
`;

db.query(createMedicalRecordsTableSql, (err) => {
  if (err) {
    console.error("Failed to ensure medical_records table exists", err.message);
  }
});

router.get("/", (req, res) => {
  const sql = `
    SELECT
      mr.id,
      mr.patient_id,
      mr.doctor_id,
      p.name AS patient_name,
      d.name AS doctor_name,
      d.department AS doctor_department,
      mr.visit_date,
      mr.diagnosis,
      mr.notes,
      mr.created_at,
      mr.updated_at
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    JOIN doctors d ON mr.doctor_id = d.id
    ORDER BY mr.visit_date DESC, mr.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

router.get("/patient/:patientId", (req, res) => {
  const patientId = Number(req.params.patientId);
  if (!Number.isInteger(patientId) || patientId <= 0) {
    return res.status(400).json({ message: "Valid patient id is required" });
  }

  const sql = `
    SELECT
      mr.id,
      mr.patient_id,
      mr.doctor_id,
      d.name AS doctor_name,
      d.department AS doctor_department,
      mr.visit_date,
      mr.diagnosis,
      mr.notes,
      mr.created_at,
      mr.updated_at
    FROM medical_records mr
    JOIN doctors d ON mr.doctor_id = d.id
    WHERE mr.patient_id = ?
    ORDER BY mr.visit_date DESC, mr.id DESC
  `;

  db.query(sql, [patientId], (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

router.post("/add", (req, res) => {
  const patientId = Number(req.body?.patient_id);
  const doctorId = Number(req.body?.doctor_id);
  const visitDate = String(req.body?.visit_date || "").trim();
  const diagnosis = String(req.body?.diagnosis || "").trim();
  const notes = req.body?.notes == null ? null : String(req.body.notes).trim();

  if (!Number.isInteger(patientId) || patientId <= 0) {
    return res.status(400).json({ message: "Valid patient_id is required" });
  }
  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return res.status(400).json({ message: "Valid doctor_id is required" });
  }
  if (!visitDate) {
    return res.status(400).json({ message: "visit_date is required" });
  }
  if (!diagnosis || diagnosis.length < 2) {
    return res.status(400).json({ message: "Diagnosis must be at least 2 characters" });
  }

  const sql = `
    INSERT INTO medical_records (patient_id, doctor_id, visit_date, diagnosis, notes)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [patientId, doctorId, visitDate, diagnosis, notes], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({
      message: "Medical record added successfully",
      id: result.insertId,
    });
  });
});

router.put("/update/:id", (req, res) => {
  const id = Number(req.params.id);
  const patientId = Number(req.body?.patient_id);
  const doctorId = Number(req.body?.doctor_id);
  const visitDate = String(req.body?.visit_date || "").trim();
  const diagnosis = String(req.body?.diagnosis || "").trim();
  const notes = req.body?.notes == null ? null : String(req.body.notes).trim();

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Valid id is required" });
  }
  if (!Number.isInteger(patientId) || patientId <= 0) {
    return res.status(400).json({ message: "Valid patient_id is required" });
  }
  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return res.status(400).json({ message: "Valid doctor_id is required" });
  }
  if (!visitDate) {
    return res.status(400).json({ message: "visit_date is required" });
  }
  if (!diagnosis || diagnosis.length < 2) {
    return res.status(400).json({ message: "Diagnosis must be at least 2 characters" });
  }

  const sql = `
    UPDATE medical_records
    SET patient_id = ?, doctor_id = ?, visit_date = ?, diagnosis = ?, notes = ?
    WHERE id = ?
  `;

  db.query(sql, [patientId, doctorId, visitDate, diagnosis, notes, id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Medical record not found" });
    }
    return res.json({ message: "Medical record updated" });
  });
});

router.delete("/delete/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Valid id is required" });
  }

  db.query("DELETE FROM medical_records WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Medical record not found" });
    }
    return res.json({ message: "Medical record deleted" });
  });
});

module.exports = router;
