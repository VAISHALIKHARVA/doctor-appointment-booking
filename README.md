# Doctor Appointment Booking System

A role-based appointment booking system using HTML, Tailwind CSS, vanilla JavaScript, and JSON Server.

## Setup

### 1. Install JSON Server

```bash
npm install -g json-server
```

### 2. Run the backend

Install JSON Server globally once, then run it:

```bash
npm install -g json-server
json-server --watch db.json --port 3000
```

API base URL: **http://localhost:3000**

### 3. Open the app

Serve the project with any static server (e.g. Live Server in VS Code) or open HTML files directly. For full API access, use a server that serves from the project root so `fetch('http://localhost:3000/...')` works.

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

1. **Use full URL**  
   The app uses `http://localhost:3000` in `js/api.js`. Never use a relative path like `/appointments` so fetch does not hit the wrong origin (e.g. 5500).

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



json-server --watch db.json --port 3000 --host 0.0.0.0
npx serve . -l tcp://0.0.0.0:8080