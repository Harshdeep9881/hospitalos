const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all patients
router.get("/", (req, res) => {
    db.query("SELECT * FROM patients", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ADD patient
router.post("/add", (req, res) => {
    const { name, age, gender, phone } = req.body;

    const sql =
        "INSERT INTO patients(name, age, gender, phone) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, age, gender, phone], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            message: "Patient added successfully",
            id: result.insertId
        });
    });
});

// DELETE patient
router.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM patients WHERE id=?",
        [id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Patient deleted" });
        }
    );
});

// UPDATE patient
router.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const { name, age, gender, phone } = req.body;

    const sql =
        "UPDATE patients SET name=?, age=?, gender=?, phone=? WHERE id=?";

    db.query(sql, [name, age, gender, phone, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Patient updated" });
    });
});

module.exports = router;   // ✅ MUST BE PRESENT
