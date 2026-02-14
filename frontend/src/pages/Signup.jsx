import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__header">
          <div className="auth__badge">🏥</div>
          <div>
            <h1>Create account</h1>
            <p>Register a new HospitalOS user in the same hospital database.</p>
          </div>
        </div>

        <form className="auth__form" onSubmit={register}>
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="staff@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          {error ? <div className="field__error">{error}</div> : null}

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="auth__hint">
          Already have an account? <Link className="auth__link" to="/">Sign in</Link>
        </div>
      </div>

      <div className="auth__hero">
        <div className="hero-card">
          <h2>Secure onboarding</h2>
          <p>New staff can now register directly and start using patient and appointment tools.</p>
          <div className="hero-stats">
            <div>
              <strong>1</strong>
              <span>shared database</span>
            </div>
            <div>
              <strong>∞</strong>
              <span>new users</span>
            </div>
            <div>
              <strong>2h</strong>
              <span>session token</span>
            </div>
          </div>
        </div>
        <div className="hero-strip">
          <div>Register</div>
          <div>Login</div>
          <div>Patients</div>
          <div>Appointments</div>
        </div>
      </div>
    </div>
  );
}
