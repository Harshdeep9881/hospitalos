const express = require("express");
const router = express.Router();
const db = require("../config/db");

const hasDepartmentIdColumn = (callback) => {
  db.query("SHOW COLUMNS FROM doctors LIKE 'department_id'", (err, rows) => {
    if (err) return callback(err);
    return callback(null, Array.isArray(rows) && rows.length > 0);
  });
};

const getDepartmentNameById = (departmentId, callback) => {
  db.query("SELECT name FROM departments WHERE id = ?", [departmentId], (err, rows) => {
    if (err) return callback(err);
    const name = rows?.[0]?.name;
    if (!name) return callback(null, null);
    return callback(null, name);
  });
};

const parsePositiveInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
};

// ========================
// GET all doctors
// ========================
router.get("/", (req, res) => {
  hasDepartmentIdColumn((schemaErr, hasDepartmentId) => {
    if (schemaErr) return res.status(500).json(schemaErr);

    const sql = hasDepartmentId
      ? `
        SELECT
          d.id,
          d.name,
          d.department_id,
          COALESCE(dep.name, d.department) AS department
        FROM doctors d
        LEFT JOIN departments dep ON dep.id = d.department_id
        ORDER BY d.id DESC
      `
      : `
        SELECT
          d.id,
          d.name,
          NULL AS department_id,
          d.department AS department
        FROM doctors d
        ORDER BY d.id DESC
      `;

    db.query(sql, (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
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

  hasDepartmentIdColumn((schemaErr, hasDepartmentId) => {
    if (schemaErr) return res.status(500).json(schemaErr);

    if (hasDepartmentId) {
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

        return res.json({
          message: "Doctor added successfully",
          id: result.insertId,
        });
      });
      return;
    }

    getDepartmentNameById(departmentId, (depErr, departmentName) => {
      if (depErr) return res.status(500).json(depErr);
      if (!departmentName) {
        return res.status(404).json({ message: "Department not found" });
      }

      db.query(
        "INSERT INTO doctors (name, department) VALUES (?, ?)",
        [name, departmentName],
        (err, result) => {
          if (err) return res.status(500).json(err);
          return res.json({
            message: "Doctor added successfully",
            id: result.insertId,
          });
        }
      );
    });
  });
});

// ========================
// DELETE doctor
// ========================
router.delete("/delete/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Valid doctor id is required" });
  }

  db.getConnection((connErr, connection) => {
    if (connErr) return res.status(500).json({ message: "Unable to open database connection" });

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        return res.status(500).json({ message: "Unable to start transaction" });
      }

      connection.query("SELECT id FROM doctors WHERE id = ? LIMIT 1", [id], (existsErr, rows) => {
        if (existsErr) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ message: "Failed to load doctor" });
          });
        }

        if (!Array.isArray(rows) || rows.length === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(404).json({ message: "Doctor not found" });
          });
        }

        connection.query("DELETE FROM appointments WHERE doctor_id = ?", [id], (appointmentsErr) => {
          if (appointmentsErr && appointmentsErr.code === "ER_NO_SUCH_TABLE") {
            appointmentsErr = null;
          }
          if (appointmentsErr) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ message: "Failed to remove doctor appointments" });
            });
          }

          connection.query("DELETE FROM medical_records WHERE doctor_id = ?", [id], (recordsErr) => {
            if (recordsErr && recordsErr.code === "ER_NO_SUCH_TABLE") {
              recordsErr = null;
            }
            if (recordsErr) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ message: "Failed to remove doctor medical records" });
              });
            }

            connection.query("DELETE FROM doctors WHERE id = ?", [id], (deleteErr, deleteResult) => {
              if (deleteErr) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ message: "Failed to delete doctor" });
                });
              }

              if (!deleteResult || deleteResult.affectedRows === 0) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(404).json({ message: "Doctor not found" });
                });
              }

              connection.commit((commitErr) => {
                if (commitErr) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ message: "Failed to commit doctor deletion" });
                  });
                }

                connection.release();
                return res.json({ message: "Doctor deleted" });
              });
            });
          });
        });
      });
    });
  });
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

  hasDepartmentIdColumn((schemaErr, hasDepartmentId) => {
    if (schemaErr) return res.status(500).json(schemaErr);

    if (hasDepartmentId) {
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
        return res.json({ message: "Doctor updated" });
      });
      return;
    }

    getDepartmentNameById(departmentId, (depErr, departmentName) => {
      if (depErr) return res.status(500).json(depErr);
      if (!departmentName) {
        return res.status(404).json({ message: "Department not found" });
      }

      db.query(
        "UPDATE doctors SET name = ?, department = ? WHERE id = ?",
        [name, departmentName, id],
        (err, result) => {
          if (err) return res.status(500).json(err);
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Doctor not found" });
          }
          return res.json({ message: "Doctor updated" });
        }
      );
    });
  });
});

module.exports = router;
