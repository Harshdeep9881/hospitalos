const express = require("express");
const router = express.Router();
const db = require("../config/db");

const parsePositiveInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
};

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
const isValidTime = (value) => /^\d{2}:\d{2}(:\d{2})?$/.test(String(value || "").trim());

const findDoctorTimeConflict = (doctorId, date, time, excludeAppointmentId, callback) => {
  const params = [doctorId, date, time];
  let sql = `
    SELECT id
    FROM appointments
    WHERE doctor_id = ?
      AND appointment_date = ?
      AND appointment_time = ?
  `;

  if (excludeAppointmentId) {
    sql += " AND id <> ?";
    params.push(excludeAppointmentId);
  }

  sql += " LIMIT 1";

  db.query(sql, params, (err, rows) => {
    if (err) return callback(err);
    return callback(null, Array.isArray(rows) && rows.length > 0);
  });
};

// GET appointments
router.get("/", (req, res) => {
  const sql = `
    SELECT
      a.id,
      a.patient_id,
      a.doctor_id,
      p.name AS patient,
      d.name AS doctor,
      COALESCE(dep.name, d.department) AS department,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
      TIME_FORMAT(a.appointment_time, '%H:%i') AS appointment_time
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    LEFT JOIN departments dep ON dep.id = d.department_id
    ORDER BY a.appointment_date DESC, a.appointment_time ASC, a.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Unable to fetch appointments" });
    return res.json(results);
  });
});

// ADD appointment
router.post("/add", (req, res) => {
  const patientId = parsePositiveInt(req.body?.patient_id);
  const doctorId = parsePositiveInt(req.body?.doctor_id);
  const appointmentDate = String(req.body?.appointment_date || "").trim();
  const appointmentTime = String(req.body?.appointment_time || "").trim();

  if (!patientId) return res.status(400).json({ message: "Valid patient_id is required" });
  if (!doctorId) return res.status(400).json({ message: "Valid doctor_id is required" });
  if (!isValidDate(appointmentDate)) return res.status(400).json({ message: "Valid appointment_date is required (YYYY-MM-DD)" });
  if (!isValidTime(appointmentTime)) return res.status(400).json({ message: "Valid appointment_time is required (HH:MM)" });

  findDoctorTimeConflict(doctorId, appointmentDate, appointmentTime, null, (conflictErr, hasConflict) => {
    if (conflictErr) return res.status(500).json({ message: "Unable to validate appointment slot" });
    if (hasConflict) {
      return res.status(409).json({ message: "Doctor already has an appointment at this date and time" });
    }

    const sql = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [patientId, doctorId, appointmentDate, appointmentTime], (err, result) => {
      if (err) return res.status(500).json({ message: "Unable to create appointment" });
      return res.status(201).json({
        message: "Appointment booked successfully",
        id: result.insertId,
      });
    });
  });
});

// UPDATE appointment
router.put("/update/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  const patientId = parsePositiveInt(req.body?.patient_id);
  const doctorId = parsePositiveInt(req.body?.doctor_id);
  const appointmentDate = String(req.body?.appointment_date || "").trim();
  const appointmentTime = String(req.body?.appointment_time || "").trim();

  if (!id) return res.status(400).json({ message: "Valid id is required" });
  if (!patientId) return res.status(400).json({ message: "Valid patient_id is required" });
  if (!doctorId) return res.status(400).json({ message: "Valid doctor_id is required" });
  if (!isValidDate(appointmentDate)) return res.status(400).json({ message: "Valid appointment_date is required (YYYY-MM-DD)" });
  if (!isValidTime(appointmentTime)) return res.status(400).json({ message: "Valid appointment_time is required (HH:MM)" });

  findDoctorTimeConflict(doctorId, appointmentDate, appointmentTime, id, (conflictErr, hasConflict) => {
    if (conflictErr) return res.status(500).json({ message: "Unable to validate appointment slot" });
    if (hasConflict) {
      return res.status(409).json({ message: "Doctor already has an appointment at this date and time" });
    }

    const sql = `
      UPDATE appointments
      SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?
      WHERE id = ?
    `;

    db.query(sql, [patientId, doctorId, appointmentDate, appointmentTime, id], (err, result) => {
      if (err) return res.status(500).json({ message: "Unable to update appointment" });
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      return res.json({ message: "Appointment updated" });
    });
  });
});

// DELETE appointment
router.delete("/delete/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ message: "Valid id is required" });

  db.query("DELETE FROM appointments WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Unable to delete appointment" });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.json({ message: "Appointment deleted" });
  });
});

module.exports = router;
