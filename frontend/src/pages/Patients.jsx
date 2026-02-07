import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const { push } = useToast();

  useEffect(() => {
    api.get("/patients").then(res => setPatients(res.data));
  }, []);

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters.";
    }
    const ageNum = Number(form.age);
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
      next.age = "Age must be between 0 and 120.";
    }
    if (!form.gender.trim()) {
      next.gender = "Gender is required.";
    }
    const phone = form.phone.trim();
    if (!/^[0-9+ -]{7,}$/.test(phone)) {
      next.phone = "Phone must be at least 7 digits.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitPatient = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender.trim(),
        phone: form.phone.trim(),
      };
      if (editingId) {
        await api.put(`/patients/update/${editingId}`, payload);
        push("Patient updated.");
      } else {
        await api.post("/patients/add", payload);
        push("Patient added.");
      }
      const res = await api.get("/patients");
      setPatients(res.data);
      setForm({ name: "", age: "", gender: "", phone: "" });
      setEditingId(null);
      setErrors({});
    } catch (err) {
      push("Failed to save patient.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      phone: patient.phone || "",
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", age: "", gender: "", phone: "" });
    setErrors({});
  };

  const deletePatient = async (id) => {
    if (!confirm("Delete this patient?")) return;
    try {
      await api.delete(`/patients/delete/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      push("Patient deleted.");
    } catch {
      push("Failed to delete patient.", "error");
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
            <h2>{editingId ? "Edit Patient" : "Add Patient"}</h2>
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
                {errors.name && <span className="field__error">{errors.name}</span>}
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
                {errors.age && <span className="field__error">{errors.age}</span>}
              </label>
              <label className="field">
                <span>Gender</span>
                <input
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  placeholder="Gender"
                  required
                />
                {errors.gender && <span className="field__error">{errors.gender}</span>}
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone"
                  required
                />
                {errors.phone && <span className="field__error">{errors.phone}</span>}
              </label>
              <div className="action-buttons">
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update patient" : "Save patient"}
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
              <div className="table table--patients">
                <div className="table__row table__row--header">
                  <span>Name</span>
                  <span>Age</span>
                  <span>Gender</span>
                  <span>Phone</span>
                  <span>Actions</span>
                </div>
                {patients.map((p) => (
                  <div className="table__row" key={p.id}>
                    <span>{p.name}</span>
                    <span>{p.age}</span>
                    <span>{p.gender}</span>
                    <span>{p.phone}</span>
                    <span className="action-buttons">
                      <button className="btn--tiny" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button className="btn--tiny btn--danger" onClick={() => deletePatient(p.id)}>
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
