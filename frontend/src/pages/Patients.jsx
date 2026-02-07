import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/patients").then(res => setPatients(res.data));
  }, []);

  const submitPatient = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/patients/add", {
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender.trim(),
        phone: form.phone.trim(),
      });
      const res = await api.get("/patients");
      setPatients(res.data);
      setForm({ name: "", age: "", gender: "", phone: "" });
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
            <h1>Patients</h1>
            <p>Track patient profiles and contact details.</p>
          </div>
        </div>

        <section className="panel">
          <div className="panel__header">
            <h2>Add Patient</h2>
            <span className="muted">Required fields only</span>
          </div>
          <div className="panel__body">
            <form className="form-grid" onSubmit={submitPatient}>
              <label className="field">
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Patient name"
                  required
                />
              </label>
              <label className="field">
                <span>Age</span>
                <input
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Age"
                  required
                />
              </label>
              <label className="field">
                <span>Gender</span>
                <input
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  placeholder="Gender"
                  required
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone"
                  required
                />
              </label>
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save patient"}
              </button>
            </form>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Active Patients</h2>
            <span className="muted">{patients.length} total</span>
          </div>
          <div className="panel__body">
            {patients.length === 0 ? (
              <div className="empty-state">
                <h3>No patients yet</h3>
                <p>Add a patient to start tracking visits.</p>
              </div>
            ) : (
              <div className="table">
                <div className="table__row table__row--header">
                  <span>Name</span>
                  <span>Age</span>
                  <span>Gender</span>
                  <span>Phone</span>
                </div>
                {patients.map((p) => (
                  <div className="table__row" key={p.id}>
                    <span>{p.name}</span>
                    <span>{p.age}</span>
                    <span>{p.gender}</span>
                    <span>{p.phone}</span>
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
