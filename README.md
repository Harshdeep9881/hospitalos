## Hospital Docker Project

This repo has:
- `backend/` (Node/Express + MySQL)
- `frontend/` (React + Vite)
- `docker-compose.yml` for MySQL + backend

### Quick start (recommended)
Run MySQL + backend in Docker, frontend locally:

1) Start MySQL + backend
```
docker-compose up --build
```

2) Start frontend
```
cd frontend
npm install
npm run dev
```

Frontend will run on Vite (usually `http://localhost:5173`) and the API is `http://localhost:5000`.

### Local backend (no Docker)
If you want to run backend directly with `npm`:

1) Install MySQL (or run it via Docker)
2) Ensure DB is reachable at `localhost:3307` (matches docker-compose)
3) Update `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Pusad@123
DB_NAME=hospital
DB_PORT=3307
PORT=5000
```
4) Start backend:
```
cd backend
npm install
npm start
```

### Common issues
- If backend is started **outside Docker** but `.env` has `DB_HOST=mysql`, it will fail. Use `localhost` instead.
- The frontend calls `http://localhost:5000`. If backend runs elsewhere, update `frontend/src/api/axios.js`.
- Login uses a simple env-based account:
  - `ADMIN_EMAIL=admin@hospital.com`
  - `ADMIN_PASSWORD=admin123`

### Database tables
The API expects these tables to exist:
- `patients` (id, name, age, gender, phone)
- `doctors` (id, name, department)
- `appointments` (id, patient_id, doctor_id, appointment_date, appointment_time)

If you need SQL to create tables, tell me and I’ll add it.
