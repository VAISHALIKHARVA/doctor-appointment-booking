# Doctor Appointment Booking System

A role-based appointment booking system using HTML, Tailwind CSS, vanilla JavaScript, and JSON Server.

## Setup

### 1. Install JSON Server

```bash
npm install -g json-server
```

### 2. Run the backend

**On your PC (local only):**

```bash
json-server --watch db.json --port 3000
```

**On a VPS / remote server** (so browsers can reach the API from the internet):

```bash
json-server --watch db.json --port 3000 --host 0.0.0.0
```

- Open **port 3000** in the server firewall / security group.
- Without `--host 0.0.0.0`, JSON Server often listens only on `127.0.0.1` and remote requests fail.

> **Do not type `0.0.0.0` in the browser.** That address is only for starting the server. It is not a valid website URL (`ERR_ADDRESS_INVALID`).
>
> | Where you are | Open this in the browser to test the API |
> |---------------|-------------------------------------------|
> | Same PC as JSON Server | **http://localhost:3000** or **http://127.0.0.1:3000** |
> | Another device / internet | **http://YOUR_SERVER_IP:3000** (real IP, e.g. `192.168.1.5` or your VPS public IP) |

API URL: **http://localhost:3000** when you open the site on the same PC; **http://YOUR_SERVER_IP:3000** when you open the site by IP/domain (the app picks this automatically—see below).

### 3. Open the app

Serve the project with any static server. The app calls JSON Server at **`js/api.js`**:
- **localhost** → `http://localhost:3000`
- **Any other hostname** (e.g. your server IP or domain) → `http://THAT_HOSTNAME:3000`

**Custom API URL:** add this **before** `js/api.js` on every page (or in a shared header):

```html
<script>window.API_BASE = 'http://YOUR_IP_OR_DOMAIN:3000';</script>
```

**HTTPS website:** the browser blocks `http://...:3000` (mixed content). Put nginx/Caddy in front and proxy e.g. `/api` → `http://127.0.0.1:3000`, then set `window.API_BASE` to `https://your-domain.com/api` (paths must match your proxy).

**Default credentials:**
- Doctor: `doctor1@gmail.com` / `123456`
- Patient: `patient1@gmail.com` / `123456`

## Project structure

- `index.html` – Login
- `signup.html` – Sign up (Doctor / Patient)
- `patient-dashboard.html` – Patient: list doctors, book
- `doctor-dashboard.html` – Doctor: today’s patients, slots, mark completed
- `booking.html` – Book appointment, token, queue
- `js/api.js` – API helpers
- `js/utils.js` – Shared utilities
- `js/auth.js` – Login/session
- `js/patient.js` – Patient dashboard & booking
- `js/doctor.js` – Doctor dashboard

## API endpoints

| Action           | Endpoint                    |
|------------------|-----------------------------|
| Get users        | GET /users                  |
| Create user      | POST /users                 |
| Get doctors      | GET /doctors                |
| Update doctor    | PATCH /doctors/:id          |
| Get appointments | GET /appointments           |
| Book             | POST /appointments          |
| Update appointment | PATCH /appointments/:id  |

Filter: `?doctorId=1&date=2026-02-24&patientId=2`

## Troubleshooting (doctor dashboard shows 0 / empty)

1. **API URL**  
   See `js/api.js`: local = localhost:3000; deployed = same hostname as the page on port 3000. If that’s wrong, set `window.API_BASE` before `api.js` loads.

2. **Restart JSON Server after editing db.json**  
   Stop with `Ctrl+C`, then run again:
   ```bash
   json-server --watch db.json --port 3000
   ```

3. **Check the API in the browser**  
   Open: `http://localhost:3000/appointments?doctorId=1&date=2026-02-24`  
   You should see JSON. If you get an error or empty `[]`, the server is not running from the project folder or the data does not match the filters.

4. **Doctor dashboard date**  
   Use the **Date** picker on the doctor dashboard and choose a date that has appointments in `db.json` (e.g. `2026-02-24`), then click **Refresh**.

5. **Console debug**  
   Open DevTools (F12) → Console. On load you should see `GET http://localhost:3000/appointments?doctorId=...&date=...` and `Doctor Appointments: n [...]`. If the GET URL is wrong or you see a network error, fix the server or port.