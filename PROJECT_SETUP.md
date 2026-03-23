# Doctor Appointment Booking — Project Setup

This document describes how to set up and run the **Doctor Appointment Booking** system locally or on a server.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, Tailwind CSS (CDN), vanilla JavaScript |
| Backend / API | [JSON Server](https://github.com/typicode/json-server) (REST API from `db.json`) |
| Data | `db.json` (users, doctors, appointments) |

No build step or `npm install` in the project folder is required for the app itself—only **Node.js** (for `npm` / `json-server`).

---

## Prerequisites

1. **Node.js** (LTS recommended, e.g. v18+) — includes `npm`  
   - Download: [https://nodejs.org](https://nodejs.org)  
   - Verify: `node -v` and `npm -v`

2. **JSON Server** (global install)

   ```bash
   npm install -g json-server
   ```

   Verify: `json-server --version`

3. **Browser** — Chrome, Edge, or Firefox (DevTools useful for debugging).

---

## Project structure (reference)

```
doctor-appointment-booking/
├── index.html              # Entry / login
├── login.html
├── signup.html
├── patient-dashboard.html
├── doctor-dashboard.html
├── booking.html
├── db.json                 # API data (JSON Server watches this)
├── js/
│   ├── api.js              # API base URL & HTTP helpers
│   ├── auth.js
│   ├── patient.js
│   ├── doctor.js
│   ├── utils.js
│   └── ui.js
├── images/
└── README.md
```

Run all commands from the folder that contains **`db.json`** and **`index.html`**.

---

## Local development setup

### Step 1 — Clone or copy the project

```bash
cd path/to/doctor-appointment-booking
```

### Step 2 — Start the API (JSON Server)

**Same machine only (typical dev):**

```bash
json-server --watch db.json --port 3000
```

Leave this terminal open. The API base URL is **`http://localhost:3000`**.

**Remote / VPS** (browsers must reach the API from the network):

```bash
json-server --watch db.json --port 3000 --host 0.0.0.0
```

- Open **TCP port 3000** in the firewall / cloud security group.  
- Do **not** open `http://0.0.0.0:3000` in a browser; use the server’s real IP or hostname.

### Step 3 — Serve the frontend (static files)

The app is static HTML/JS. You must open it over **http://** (not `file://`) so fetch calls work reliably.

**Option A — VS Code “Live Server”**  
Install the *Live Server* extension → right-click `index.html` → **Open with Live Server**.

**Option B — Python**

```bash
# Python 3
python -m http.server 8080
```

Then open: `http://localhost:8080` (or the path to `index.html`).

**Option C — npx (no global install of a server)**

```bash
npx --yes serve -l 8080
```

### Step 4 — API URL behavior

- Page on **`localhost`** → app uses **`http://localhost:3000`**.  
- Page on **another host** (IP/domain) → app uses **`http://<same-host>:3000`**.

**Override API URL** — before `js/api.js` on each page (or in a shared layout):

```html
<script>window.API_BASE = 'http://YOUR_IP_OR_DOMAIN:3000';</script>
```

**HTTPS site + HTTP API** — blocked as mixed content. Use a reverse proxy (nginx/Caddy) e.g. `/api` → `http://127.0.0.1:3000`, then set:

```html
<script>window.API_BASE = 'https://your-domain.com/api';</script>
```

---

## Default test accounts

| Role   | Email              | Password |
|--------|--------------------|----------|
| Doctor | doctor1@gmail.com  | 123456   |
| Patient| patient1@gmail.com | 123456   |

---

## Quick verification checklist

| Check | Action |
|-------|--------|
| API running | Browser: `http://localhost:3000/users` → JSON array |
| App can reach API | F12 → Network: requests to port 3000 succeed |
| Doctor dashboard empty | Pick a date that exists in `db.json` for that doctor; restart JSON Server after editing `db.json` |

---

## Useful API endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Users | GET/POST | `/users` |
| Doctors | GET/PATCH | `/doctors`, `/doctors/:id` |
| Appointments | GET/POST/PATCH | `/appointments`, `/appointments/:id` |

Example filter:  
`GET http://localhost:3000/appointments?doctorId=1&date=2026-02-24`

---

## Troubleshooting

1. **CORS / failed fetch** — Serve the site over `http://localhost` (or your domain), not `file://`.  
2. **Wrong API host** — Set `window.API_BASE` or fix hostname/port.  
3. **Empty data after editing `db.json`** — Stop JSON Server (`Ctrl+C`), start again with `--watch`.  
4. **Port 3000 in use** — Use another port and set `window.API_BASE` to match.

---

## Summary commands (local dev)

```bash
# Terminal 1 — API (from project root)
json-server --watch db.json --port 3000

# Terminal 2 — static site (example)
python -m http.server 8080
```

Open **`http://localhost:8080`** → log in with the default accounts above.

For more detail, see **`README.md`**.
