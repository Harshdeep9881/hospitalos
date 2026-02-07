import { useState } from "react";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (event) => {
    event.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__header">
          <div className="auth__badge">🏥</div>
          <div>
            <h1>HospitalOS</h1>
            <p>Secure access for front-desk and staff operations.</p>
          </div>
        </div>

        <form className="auth__form" onSubmit={login}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="admin@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="btn btn--primary" type="submit">
            Sign in
          </button>
        </form>

        <div className="auth__hint">
          Use the demo admin credentials from the README.
        </div>
      </div>

      <div className="auth__hero">
        <div className="hero-card">
          <h2>Today’s focus</h2>
          <p>Coordinate patient intake, staffing, and appointments in one view.</p>
          <div className="hero-stats">
            <div>
              <strong>24</strong>
              <span>scheduled</span>
            </div>
            <div>
              <strong>6</strong>
              <span>on duty</span>
            </div>
            <div>
              <strong>3</strong>
              <span>rooms open</span>
            </div>
          </div>
        </div>
        <div className="hero-strip">
          <div>Intake</div>
          <div>Consults</div>
          <div>Billing</div>
          <div>Care Plans</div>
        </div>
      </div>
    </div>
  );
}
