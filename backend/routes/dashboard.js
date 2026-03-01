const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========================
// GET dashboard summary
// ========================
router.get("/summary", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*)
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       JOIN patients p ON p.id = a.patient_id
       WHERE a.appointment_date = CURDATE()) AS todaysAppointments,
      (SELECT COUNT(*)
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       JOIN patients p ON p.id = a.patient_id
       WHERE a.appointment_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) AS yesterdaysAppointments,
      (SELECT COUNT(*) FROM doctors) AS totalDoctors,
      (SELECT COUNT(DISTINCT a.doctor_id)
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.appointment_date = CURDATE()) AS scheduledDoctors
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    const row = results && results[0] ? results[0] : {};

    const todaysAppointments = Number(row.todaysAppointments || 0);
    const yesterdaysAppointments = Number(row.yesterdaysAppointments || 0);
    const totalDoctors = Number(row.totalDoctors || 0);
    const scheduledDoctors = Number(row.scheduledDoctors || 0);
    const availableDoctors = Math.max(totalDoctors - scheduledDoctors, 0);

    res.json({
      todaysAppointments,
      yesterdaysAppointments,
      totalDoctors,
      scheduledDoctors,
      availableDoctors,
    });
  });
});

module.exports = router;
