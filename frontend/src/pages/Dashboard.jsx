import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get("/dashboard/summary")
      .then((res) => {
        if (!alive) return;
        setSummary(res.data);
        setSummaryError(false);
      })
      .catch(() => {
        if (!alive) return;
        setSummaryError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const appointmentDelta = useMemo(() => {
    if (!summary) return null;
    return summary.todaysAppointments - summary.yesterdaysAppointments;
  }, [summary]);

  const appointmentDeltaLabel = useMemo(() => {
    if (summaryError) return "Dashboard data unavailable";
    if (appointmentDelta === null) return "Loading today’s total";
    if (appointmentDelta === 0) return "Same as yesterday";
    if (appointmentDelta > 0) return `+${appointmentDelta} vs yesterday`;
    return `${appointmentDelta} vs yesterday`;
  }, [appointmentDelta, summaryError]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-header">
          <div>
            <h1>Hospital Dashboard</h1>
            <p>Monitor today’s flow and clinic readiness at a glance.</p>
          </div>
          <button className="btn btn--primary">New Intake</button>
        </div>

        <section className="card-grid">
          <article className="card">
            <h3>Today’s Appointments</h3>
            <p className="metric">{summary ? summary.todaysAppointments : "—"}</p>
            <span className="muted">{appointmentDeltaLabel}</span>
          </article>
          <article className="card">
            <h3>Available Doctors</h3>
            <p className="metric">
              {summary ? summary.availableDoctors : "—"}
            </p>
            <span className="muted">
              {summary
                ? `${summary.scheduledDoctors} scheduled today`
                : summaryError
                  ? "Dashboard data unavailable"
                  : "Loading availability"}
            </span>
          </article>
          <article className="card">
            <h3>Open Rooms</h3>
            <p className="metric">3</p>
            <span className="muted">Prep in progress</span>
          </article>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Operational Snapshot</h2>
            <button className="btn btn--ghost">Download report</button>
          </div>
          <div className="panel__body">
            <div className="timeline">
              <div>
                <strong>08:30</strong>
                <span>Morning triage completed</span>
              </div>
              <div>
                <strong>10:00</strong>
                <span>Lab results batch delivered</span>
              </div>
              <div>
                <strong>12:00</strong>
                <span>Shift handoff briefing</span>
              </div>
              <div>
                <strong>15:00</strong>
                <span>Pharmacy restock window</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
