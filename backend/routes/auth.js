const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
const adminEmail = String(process.env.ADMIN_EMAIL || "admin@hospital.com").trim().toLowerCase();
const adminPassword = String(process.env.ADMIN_PASSWORD || "admin123").trim();
const SALT_ROUNDS = 10;

const usersTableSql = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(usersTableSql, (err) => {
  if (err) {
    console.error("Failed to ensure users table exists", err.message);
  }
});

const signToken = (email, id = null) => jwt.sign({ email, id }, jwtSecret, { expiresIn: "2h" });

router.post("/register", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (name.length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters" });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (email === adminEmail) {
    return res.status(400).json({ message: "This email is reserved" });
  }

  try {
    const [existing] = await db.promise().query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db
      .promise()
      .query("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)", [name, email, passwordHash]);

    const token = signToken(email, result.insertId);
    return res.status(201).json({ token, user: { id: result.insertId, name, email } });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user" });
  }
});

// Login with DB users, with fallback admin credentials from env
router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT id, full_name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length > 0) {
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(user.email, user.id);
      return res.json({ token, user: { id: user.id, name: user.full_name, email: user.email } });
    }

    if (email === adminEmail && password === adminPassword) {
      const token = signToken(adminEmail);
      return res.json({ token, user: { id: null, name: "Admin", email: adminEmail } });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to login" });
  }
});

module.exports = router;
