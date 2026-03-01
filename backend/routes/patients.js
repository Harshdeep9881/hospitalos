const express = require("express");
const router = express.Router();
const db = require("../config/db");

const parsePositiveInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
};

const parseNonNegativeInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 0 ? num : null;
};

// GET all patients
router.get("/", (req, res) => {
  db.query("SELECT id, name, age, gender, phone FROM patients ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Unable to fetch patients" });
    return res.json(results);
  });
});

// ADD patient
router.post("/add", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const age = parseNonNegativeInt(req.body?.age);
  const gender = String(req.body?.gender || "").trim();
  const phone = String(req.body?.phone || "").trim();

  if (name.length < 2) return res.status(400).json({ message: "Name must be at least 2 characters" });
  if (age === null || age > 120) return res.status(400).json({ message: "Age must be between 0 and 120" });
  if (gender.length < 2) return res.status(400).json({ message: "Gender must be at least 2 characters" });
  if (phone.length < 7) return res.status(400).json({ message: "Phone must be at least 7 characters" });

  const sql = "INSERT INTO patients(name, age, gender, phone) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, age, gender, phone], (err, result) => {
    if (err) return res.status(500).json({ message: "Unable to add patient" });
    return res.status(201).json({
      message: "Patient added successfully",
      id: result.insertId,
    });
  });
});

// DELETE patient
router.delete("/delete/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ message: "Valid id is required" });

  db.query("DELETE FROM patients WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Unable to delete patient" });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    return res.json({ message: "Patient deleted" });
  });
});

// UPDATE patient
router.put("/update/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  const name = String(req.body?.name || "").trim();
  const age = parseNonNegativeInt(req.body?.age);
  const gender = String(req.body?.gender || "").trim();
  const phone = String(req.body?.phone || "").trim();

  if (!id) return res.status(400).json({ message: "Valid id is required" });
  if (name.length < 2) return res.status(400).json({ message: "Name must be at least 2 characters" });
  if (age === null || age > 120) return res.status(400).json({ message: "Age must be between 0 and 120" });
  if (gender.length < 2) return res.status(400).json({ message: "Gender must be at least 2 characters" });
  if (phone.length < 7) return res.status(400).json({ message: "Phone must be at least 7 characters" });

  const sql = "UPDATE patients SET name = ?, age = ?, gender = ?, phone = ? WHERE id = ?";
  db.query(sql, [name, age, gender, phone, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Unable to update patient" });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    return res.json({ message: "Patient updated" });
  });
});

module.exports = router;
