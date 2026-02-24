const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ========================
// GET all doctors
// ========================
router.get("/", (req, res) => {
    const sql = `
      SELECT
        d.id,
        d.name,
        d.department_id,
        COALESCE(dep.name, d.department) AS department
      FROM doctors d
      LEFT JOIN departments dep ON dep.id = d.department_id
      ORDER BY d.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ========================
// ADD doctor
// ========================
router.post("/add", (req, res) => {
    const name = String(req.body?.name || "").trim();
    const departmentId = Number(req.body?.department_id);

    if (name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({ message: "Valid department_id is required" });
    }

    const sql = `
      INSERT INTO doctors (name, department, department_id)
      SELECT ?, dep.name, dep.id
      FROM departments dep
      WHERE dep.id = ?
    `;

    db.query(sql, [name, departmentId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Department not found" });
        }

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
    const id = Number(req.params.id);
    const name = String(req.body?.name || "").trim();
    const departmentId = Number(req.body?.department_id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Valid id is required" });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({ message: "Valid department_id is required" });
    }

    const sql = `
      UPDATE doctors d
      JOIN departments dep ON dep.id = ?
      SET d.name = ?, d.department = dep.name, d.department_id = dep.id
      WHERE d.id = ?
    `;

    db.query(sql, [departmentId, name, id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Doctor or department not found" });
        }
        res.json({ message: "Doctor updated" });
    });
});

module.exports = router;
