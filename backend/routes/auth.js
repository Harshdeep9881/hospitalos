const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Simple env-based login (for demo/dev)
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  const adminEmail = process.env.ADMIN_EMAIL || "admin@hospital.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "").trim();
  const expectedEmail = String(adminEmail).trim().toLowerCase();
  const expectedPassword = String(adminPassword).trim();

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (normalizedEmail !== expectedEmail || normalizedPassword !== expectedPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ email: expectedEmail }, jwtSecret, { expiresIn: "2h" });
  res.json({ token });
});

module.exports = router;
