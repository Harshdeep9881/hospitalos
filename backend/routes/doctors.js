const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========================
// GET all doctors
// ========================
router.get("/", (req, res) => {
    db.query("SELECT * FROM doctors", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ========================
// ADD doctor
// ========================
router.post("/add", (req, res) => {
    const { name, department } = req.body;

    const sql =
        "INSERT INTO doctors(name, department) VALUES (?, ?)";

    db.query(sql, [name, department], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            message: "Doctor added successfully",
            id: result.insertId
        });
    });
});

// ========================
// DELETE doctor
// ========================
router.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM doctors WHERE id=?",
        [id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Doctor deleted" });
        }
    );
});

// ========================
// UPDATE doctor
// ========================
router.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const { name, department } = req.body;

    const sql =
        "UPDATE doctors SET name=?, department=? WHERE id=?";

    db.query(sql, [name, department, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Doctor updated" });
    });
});

module.exports = router;
