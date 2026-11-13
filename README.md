# MediCare+ — Hospital Management System

A full stack web application for managing a hospital: patients, doctors, appointments, medical records, billing, pharmacy, laboratory and bed management, with role-based login and a live dashboard.

**Stack:** Node.js · Express · SQLite (better-sqlite3) · JWT auth · Vanilla JavaScript SPA · Chart.js

---

## How to run (VS Code)

1. Install **Node.js 18 or newer** from https://nodejs.org (check with `node -v`).
2. Open this folder in VS Code: **File → Open Folder → hospital-management-system**.
3. Open the terminal (**Ctrl + `**) and run:

```bash
npm install
npm start
```

4. Open **http://localhost:5000** in your browser.

The database file (`backend/hospital.db`) and demo data are created automatically on first run. To reset everything, stop the server, delete `backend/hospital.db*` and start again.

> Charts and fonts load from a CDN, so keep internet on the first time you open the app.

### Demo logins

| Role | Email | Password |
|---|---|---|
| Admin | admin@hospital.com | admin123 |
| Doctor | doctor@hospital.com | doctor123 |
| Receptionist | reception@hospital.com | reception123 |

---

## Features

- **Authentication & roles** – JWT login; admin, doctor and receptionist see different menus and have different permissions (enforced on the server too)
- **Dashboard** – live stat cards, appointment trend, department distribution, revenue chart, bed occupancy, today's schedule, pharmacy alerts
- **Patients** – registration, search/filter, blood group, allergies, medical history, full patient profile with appointments, prescriptions, lab results and bills
- **Doctors & Departments** – profiles, specialization, fee, availability, department heads
- **Appointments** – booking with **double-booking prevention**, on-leave doctor check, quick complete/cancel, date and status filters; doctors only see their own
- **Medical records** – diagnosis, prescription, notes, follow-up date, **printable prescription**
- **Laboratory** – test orders, status tracking, results, cost
- **Billing** – multi-item invoices, partial payments, auto status (Paid / Partial / Unpaid), **printable invoice**
- **Pharmacy** – stock, price, expiry, low-stock and expiring-soon alerts
- **Beds & Wards** – colour-coded bed map (available / occupied / maintenance), patient assignment
- **Staff management** – admin creates users and assigns roles
- Change password, dark mode, responsive layout (works on mobile)

## Project structure

```
hospital-management-system/
├── package.json
├── backend/
│   ├── server.js            # Express app, routes, serves the frontend
│   ├── db.js                # SQLite schema + demo data
│   ├── middleware/auth.js   # JWT + role checks
│   └── routes/
│       ├── auth.js          # login, change password, staff users
│       ├── crud.js          # reusable CRUD router factory
│       ├── entities.js      # patients, doctors, appointments, bills ...
│       └── stats.js         # dashboard statistics
└── frontend/
    ├── index.html
    ├── css/style.css        # hospital theme (teal / blue / red)
    └── js/app.js            # SPA: routing, forms, tables, charts, printing
```

## REST API (all under `/api`, JWT required except login)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Login, returns token |
| GET | `/stats` | Dashboard data |
| GET/POST | `/patients`, `/doctors`, `/departments`, `/appointments`, `/records`, `/bills`, `/medicines`, `/beds`, `/lab` | List (supports `?q=` search and filters) / create |
| GET/PUT/DELETE | `/<resource>/:id` | Read / update / delete |
| GET | `/patients/:id/summary` | Full patient history |
| GET/POST/PUT/DELETE | `/users` | Staff accounts (admin only) |

## Ideas to extend it (for viva / extra marks)

- Email/SMS appointment reminders (Nodemailer / Twilio)
- Patient self-service portal and online booking
- Insurance claims, discharge summary PDF, doctor-wise revenue reports
- Switch SQLite to MySQL/PostgreSQL/MongoDB (only `db.js` and the route queries change)
- Unit tests with Jest + Supertest

## Troubleshooting

- **`better-sqlite3` install error:** use Node 18/20/22 LTS, then delete `node_modules` and run `npm install` again. On Windows you may need to install "Desktop development with C++" build tools only if no prebuilt binary matches your Node version.
- **Port already in use:** run with another port — `PORT=5050 npm start` (Mac/Linux) or `set PORT=5050 && npm start` (Windows CMD).
