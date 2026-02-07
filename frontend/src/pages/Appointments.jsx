import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/appointments").then(res => setAppointments(res.data));
    api.get("/patients").then(res => setPatients(res.data));
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const submitAppointment = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/appointments/add", {
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
      });
      const res = await api.get("/appointments");
      setAppointments(res.data);
      setForm({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-header">
          <div>
            <h1>Appointments</h1>
            <p>Keep today’s consults and bookings on schedule.</p>
          </div>
        </div>

        <section className="panel">
          <div className="panel__header">
            <h2>Book Appointment</h2>
            <span className="muted">Select patient and doctor</span>
          </div>
          <div className="panel__body">
            <form className="form-grid form-grid--appointments" onSubmit={submitAppointment}>
              <label className="field">
                <span>Patient</span>
                <select
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Doctor</span>
                <select
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.department}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Time</span>
                <input
                  type="time"
                  value={form.appointment_time}
                  onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                  required
                />
              </label>
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {saving ? "Booking..." : "Book appointment"}
              </button>
            </form>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Upcoming</h2>
            <span className="muted">{appointments.length} total</span>
          </div>
          <div className="panel__body">
            {appointments.length === 0 ? (
              <div className="empty-state">
                <h3>No appointments yet</h3>
                <p>Schedule a visit to fill the timeline.</p>
              </div>
            ) : (
              <div className="table table--appointments">
                <div className="table__row table__row--header">
                  <span>Patient</span>
                  <span>Doctor</span>
                  <span>Department</span>
                  <span>Date</span>
                  <span>Time</span>
                </div>
                {appointments.map((a) => (
                  <div className="table__row" key={a.id}>
                    <span>{a.patient}</span>
                    <span>{a.doctor}</span>
                    <span>{a.department}</span>
                    <span>{a.appointment_date}</span>
                    <span>{a.appointment_time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
