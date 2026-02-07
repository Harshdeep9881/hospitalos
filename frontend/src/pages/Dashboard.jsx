import Navbar from "../components/Navbar";

export default function Dashboard() {
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
            <p className="metric">24</p>
            <span className="muted">+4 vs yesterday</span>
          </article>
          <article className="card">
            <h3>Available Doctors</h3>
            <p className="metric">6</p>
            <span className="muted">2 specialists on call</span>
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
