import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: "", department: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const submitDoctor = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/doctors/add", {
        name: form.name.trim(),
        department: form.department.trim(),
      });
      const res = await api.get("/doctors");
      setDoctors(res.data);
      setForm({ name: "", department: "" });
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
            <h1>Doctors</h1>
            <p>Directory of on-staff specialists and departments.</p>
          </div>
        </div>

        <section className="panel">
          <div className="panel__header">
            <h2>Add Doctor</h2>
            <span className="muted">Keep it short and clear</span>
          </div>
          <div className="panel__body">
            <form className="form-grid form-grid--two" onSubmit={submitDoctor}>
              <label className="field">
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Doctor name"
                  required
                />
              </label>
              <label className="field">
                <span>Department</span>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Department"
                  required
                />
              </label>
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save doctor"}
              </button>
            </form>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Available Doctors</h2>
            <span className="muted">{doctors.length} total</span>
          </div>
          <div className="panel__body">
            {doctors.length === 0 ? (
              <div className="empty-state">
                <h3>No doctors yet</h3>
                <p>Add the first doctor to build your roster.</p>
              </div>
            ) : (
              <div className="table table--doctors">
                <div className="table__row table__row--header">
                  <span>Name</span>
                  <span>Department</span>
                </div>
                {doctors.map((d) => (
                  <div className="table__row" key={d.id}>
                    <span>{d.name}</span>
                    <span>{d.department}</span>
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
