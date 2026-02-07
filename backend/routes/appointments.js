const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========================
// GET appointments
// ========================
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            a.id,
            p.name AS patient,
            d.name AS doctor,
            d.department,
            a.appointment_date,
            a.appointment_time
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        ORDER BY a.appointment_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ========================
// ADD appointment
// ========================
router.post("/add", (req, res) => {
    const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time
    } = req.body;

    const sql = `
        INSERT INTO appointments
        (patient_id, doctor_id, appointment_date, appointment_time)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [patient_id, doctor_id, appointment_date, appointment_time],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                message: "Appointment booked successfully",
                id: result.insertId
            });
        }
    );
});

module.exports = router;
