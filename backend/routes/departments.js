const express = require("express");
const router = express.Router();
const db = require("../config/db");

const createDepartmentsTableSql = `
  CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(createDepartmentsTableSql, (err) => {
  if (err) {
    console.error("Failed to ensure departments table exists", err.message);
  }
});

router.get("/", (req, res) => {
  db.query("SELECT id, name, description, created_at, updated_at FROM departments ORDER BY name ASC", (err, rows) => {
    if (err) return res.status(500).json(err);
    return res.json(rows);
  });
});

router.post("/add", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const description = req.body?.description == null ? null : String(req.body.description).trim();

  if (name.length < 2) {
    return res.status(400).json({ message: "Department name must be at least 2 characters" });
  }

  db.query(
    "INSERT INTO departments (name, description) VALUES (?, ?)",
    [name, description],
    (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(201).json({ message: "Department added", id: result.insertId });
    }
  );
});

router.put("/update/:id", (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body?.name || "").trim();
  const description = req.body?.description == null ? null : String(req.body.description).trim();

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Valid id is required" });
  }
  if (name.length < 2) {
    return res.status(400).json({ message: "Department name must be at least 2 characters" });
  }

  db.query(
    "UPDATE departments SET name = ?, description = ? WHERE id = ?",
    [name, description, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Department not found" });
      }
      return res.json({ message: "Department updated" });
    }
  );
});

router.delete("/delete/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Valid id is required" });
  }

  db.query("SELECT COUNT(*) AS total FROM doctors WHERE department_id = ?", [id], (countErr, rows) => {
    if (countErr) return res.status(500).json(countErr);
    const total = Number(rows?.[0]?.total || 0);
    if (total > 0) {
      return res.status(409).json({ message: "Department is assigned to doctors and cannot be deleted" });
    }

    db.query("DELETE FROM departments WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Department not found" });
      }
      return res.json({ message: "Department deleted" });
    });
  });
});

module.exports = router;
