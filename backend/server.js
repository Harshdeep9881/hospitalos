require("dotenv").config();   // MUST be first line

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const patientsRoute = require("./routes/patients");
const doctorsRoute = require("./routes/doctors");
const appointmentsRoute = require("./routes/appointments");
const authRoute = require("./routes/auth");
const dashboardRoute = require("./routes/dashboard");
const medicalRecordsRoute = require("./routes/medicalRecords");

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoute);
app.use("/patients", patientsRoute);
app.use("/doctors", doctorsRoute);
app.use("/appointments", appointmentsRoute);
app.use("/dashboard", dashboardRoute);
app.use("/medical-records", medicalRecordsRoute);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Hospital backend running");
});

// Port from .env
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
