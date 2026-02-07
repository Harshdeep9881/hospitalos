import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";

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
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const { push } = useToast();

  useEffect(() => {
    api.get("/appointments").then(res => setAppointments(res.data));
    api.get("/patients").then(res => setPatients(res.data));
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const validate = () => {
    const next = {};
    if (!form.patient_id) next.patient_id = "Patient is required.";
    if (!form.doctor_id) next.doctor_id = "Doctor is required.";
    if (!form.appointment_date) next.appointment_date = "Date is required.";
    if (!form.appointment_time) next.appointment_time = "Time is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitAppointment = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
      };
      if (editingId) {
        await api.put(`/appointments/update/${editingId}`, payload);
        push("Appointment updated.");
      } else {
        await api.post("/appointments/add", payload);
        push("Appointment booked.");
      }
      const res = await api.get("/appointments");
      setAppointments(res.data);
      setForm({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
      });
      setEditingId(null);
      setErrors({});
    } catch {
      push("Failed to save appointment.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (appointment) => {
    setEditingId(appointment.id);
    setForm({
      patient_id: String(appointment.patient_id || ""),
      doctor_id: String(appointment.doctor_id || ""),
      appointment_date: appointment.appointment_date || "",
      appointment_time: appointment.appointment_time || "",
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      patient_id: "",
      doctor_id: "",
      appointment_date: "",
      appointment_time: "",
    });
    setErrors({});
  };

  const deleteAppointment = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await api.delete(`/appointments/delete/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      push("Appointment deleted.");
    } catch {
      push("Failed to delete appointment.", "error");
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
            <h2>{editingId ? "Edit Appointment" : "Book Appointment"}</h2>
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
                {errors.patient_id && <span className="field__error">{errors.patient_id}</span>}
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
                {errors.doctor_id && <span className="field__error">{errors.doctor_id}</span>}
              </label>
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  required
                />
                {errors.appointment_date && <span className="field__error">{errors.appointment_date}</span>}
              </label>
              <label className="field">
                <span>Time</span>
                <input
                  type="time"
                  value={form.appointment_time}
                  onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                  required
                />
                {errors.appointment_time && <span className="field__error">{errors.appointment_time}</span>}
              </label>
              <div className="action-buttons">
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update appointment" : "Book appointment"}
                </button>
                {editingId && (
                  <button className="btn btn--ghost" type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
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
                  <span>Actions</span>
                </div>
                {appointments.map((a) => (
                  <div className="table__row" key={a.id}>
                    <span>{a.patient}</span>
                    <span>{a.doctor}</span>
                    <span>{a.department}</span>
                    <span>{a.appointment_date}</span>
                    <span>{a.appointment_time}</span>
                    <span className="action-buttons">
                      <button className="btn--tiny" onClick={() => startEdit(a)}>
                        Edit
                      </button>
                      <button className="btn--tiny btn--danger" onClick={() => deleteAppointment(a.id)}>
                        Delete
                      </button>
                    </span>
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
