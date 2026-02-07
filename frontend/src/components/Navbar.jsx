import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <div className="nav__brand">
          <span className="nav__logo">H</span>
          <div>
            <div className="nav__title">HospitalOS</div>
            <div className="nav__subtitle">Clinic operations</div>
          </div>
        </div>

        <nav className="nav__links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => (isActive ? "active" : "")}>
            Patients
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? "active" : "")}>
            Doctors
          </NavLink>
          <NavLink to="/appointments" className={({ isActive }) => (isActive ? "active" : "")}>
            Appointments
          </NavLink>
        </nav>

        <button
          className="btn btn--ghost"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
