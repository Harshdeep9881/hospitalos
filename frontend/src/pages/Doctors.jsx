import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: "", department: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const { push } = useToast();

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters.";
    }
    if (!form.department.trim()) {
      next.department = "Department is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitDoctor = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        department: form.department.trim(),
      };
      if (editingId) {
        await api.put(`/doctors/update/${editingId}`, payload);
        push("Doctor updated.");
      } else {
        await api.post("/doctors/add", payload);
        push("Doctor added.");
      }
      const res = await api.get("/doctors");
      setDoctors(res.data);
      setForm({ name: "", department: "" });
      setEditingId(null);
      setErrors({});
    } catch {
      push("Failed to save doctor.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (doctor) => {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name || "",
      department: doctor.department || "",
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", department: "" });
    setErrors({});
  };

  const deleteDoctor = async (id) => {
    if (!confirm("Delete this doctor?")) return;
    try {
      await api.delete(`/doctors/delete/${id}`);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      push("Doctor deleted.");
    } catch {
      push("Failed to delete doctor.", "error");
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
            <h2>{editingId ? "Edit Doctor" : "Add Doctor"}</h2>
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
                {errors.name && <span className="field__error">{errors.name}</span>}
              </label>
              <label className="field">
                <span>Department</span>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Department"
                  required
                />
                {errors.department && <span className="field__error">{errors.department}</span>}
              </label>
              <div className="action-buttons">
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update doctor" : "Save doctor"}
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
                  <span>Actions</span>
                </div>
                {doctors.map((d) => (
                  <div className="table__row" key={d.id}>
                    <span>{d.name}</span>
                    <span>{d.department}</span>
                    <span className="action-buttons">
                      <button className="btn--tiny" onClick={() => startEdit(d)}>
                        Edit
                      </button>
                      <button className="btn--tiny btn--danger" onClick={() => deleteDoctor(d.id)}>
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
