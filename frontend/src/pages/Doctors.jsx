import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", department_id: "" });
  const [departmentForm, setDepartmentForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [departmentSaving, setDepartmentSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const { push } = useToast();

  const loadDoctors = async () => {
    const res = await api.get("/doctors");
    setDoctors(res.data);
  };

  const loadDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data);
  };

  useEffect(() => {
    Promise.all([loadDoctors(), loadDepartments()]).catch(() => {
      push("Failed to load doctors data.", "error");
    });
  }, []);

  useEffect(() => {
    if (!editingId && !form.department_id && departments.length > 0) {
      setForm((prev) => ({ ...prev, department_id: String(departments[0].id) }));
    }
  }, [departments, editingId, form.department_id]);

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters.";
    }
    if (!form.department_id) {
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
        department_id: Number(form.department_id),
      };
      if (editingId) {
        await api.put(`/doctors/update/${editingId}`, payload);
        push("Doctor updated.");
      } else {
        await api.post("/doctors/add", payload);
        push("Doctor added.");
      }
      await loadDoctors();
      setForm({
        name: "",
        department_id: departments[0] ? String(departments[0].id) : "",
      });
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
      department_id: String(doctor.department_id || ""),
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      department_id: departments[0] ? String(departments[0].id) : "",
    });
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

  const submitDepartment = async (event) => {
    event.preventDefault();
    const name = departmentForm.name.trim();
    const description = departmentForm.description.trim();
    if (name.length < 2) {
      push("Department name must be at least 2 characters.", "error");
      return;
    }

    setDepartmentSaving(true);
    try {
      await api.post("/departments/add", {
        name,
        description: description || null,
      });
      await loadDepartments();
      setDepartmentForm({ name: "", description: "" });
      push("Department added.");
    } catch {
      push("Failed to add department.", "error");
    } finally {
      setDepartmentSaving(false);
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
            <span className="muted">Mapped to a configured department</span>
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
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
                {errors.department && <span className="field__error">{errors.department}</span>}
              </label>
              <div className="action-buttons">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={saving || departments.length === 0}
                >
                  {saving ? "Saving..." : editingId ? "Update doctor" : "Save doctor"}
                </button>
                {editingId && (
                  <button className="btn btn--ghost" type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {departments.length === 0 && (
              <p className="muted">Add at least one department before creating doctors.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Add Department</h2>
            <span className="muted">{departments.length} total</span>
          </div>
          <div className="panel__body">
            <form className="form-grid form-grid--two" onSubmit={submitDepartment}>
              <label className="field">
                <span>Name</span>
                <input
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  placeholder="e.g. Cardiology"
                  required
                />
              </label>
              <label className="field">
                <span>Description</span>
                <input
                  value={departmentForm.description}
                  onChange={(e) =>
                    setDepartmentForm({ ...departmentForm, description: e.target.value })
                  }
                  placeholder="Optional"
                />
              </label>
              <div className="action-buttons">
                <button className="btn btn--primary" type="submit" disabled={departmentSaving}>
                  {departmentSaving ? "Saving..." : "Save department"}
                </button>
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
