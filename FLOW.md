# MediBook – Application Flow

This document describes what happens at each step in the application (patient and doctor flows, auth, and API).

---

## 1. Entry & Landing (index.html)

- User opens **index.html** (home).
- Page shows: hero, “How to book”, “Why MediBook”, feature cards, footer.
- **Login** → `login.html`
- **Sign Up** → `signup.html`
- No auth check; anyone can view the landing page.

---

## 2. Sign Up (signup.html)

**UI**

- User chooses role: **Doctor** or **Patient** (radio).
- If **Doctor**: “Specialist” field is shown (e.g. Cardiologist).
- Fields: Name, Email, Phone, Password, Confirm Password.

**What happens on Submit (handleSignup in auth.js)**

1. Validate: name, email, phone, password; passwords match; doctor must have specialist.
2. **GET /users** → check if email already exists.
3. **POST /users** with `{ role, name, email, phone, password [, specialist ] }` → new user in `db.json` with generated `id`.
4. If role is **doctor**:
   - **POST /doctors** with `{ userId: created.id, specialist, slots: { morning, afternoon, evening } }` → new doctor record.
5. **setSession(createdUser)** → store in `localStorage` under `appointment_user` (id, role, name, email, phone [, specialist ]; no password).
6. Redirect:
   - Doctor → **doctor-dashboard.html**
   - Patient → **patient-dashboard.html**

---

## 3. Login (login.html)

**UI**

- Choose role: **Doctor** or **Patient**.
- Email, Password.

**What happens on Submit (handleLogin in auth.js)**

1. **GET /users** from API.
2. Find one user where `email`, `password`, and `role` (normalized) match.
3. If not found → toast “Invalid email, password or role.” and stop.
4. If found:
   - **setSession(user)** (same shape as signup; password not stored).
   - Toast “Login successful.”
   - Redirect:
     - Doctor → **doctor-dashboard.html**
     - Patient → **patient-dashboard.html**

**Session (localStorage)**

- Key: `appointment_user`
- Value: `{ id, role, name, email, phone [, specialist ] }`
- **Logout**: “Logout” links call `clearSession()` (remove from localStorage) then go to index/login or dashboard.

---

## 4. Patient Flow

### 4.1 Patient Dashboard (patient-dashboard.html)

**Auth**

- **requireAuth(['patient'])** in script: if no session or role ≠ patient → redirect to **login.html**.

**UI**

- Tabs: **Doctors** | **My Appointments**
- Date picker (default: today).
- Search: “Search by specialist or name” + **Search** (for Doctors tab only).

**Doctors tab (default)**

1. **loadPatientDashboard()** runs (on load and when Search / date changes).
2. **GET /doctors** and **GET /users** → **getDoctorsWithUser()** merges doctor names.
3. **GET /appointments?date= &lt;selectedDate&gt;** → appointments for that date.
4. For each doctor, compute **available slots**:  
   `limit - count(appointments for that doctor+date+slot)` for morning/afternoon/evening (only if slot enabled).
5. Optionally filter doctors by search text (name/specialist).
6. Render **doctor cards**: name, specialist, “X Available” / “Full” per slot, **Book Appointment** link (or “No slots” disabled).
7. **Book Appointment** link = `booking.html?doctorId=<id>&date=<selectedDate>`.

**My Appointments tab**

1. User clicks **My Appointments** (or lands with hash `#my-appointments`).
2. **loadMyAppointments()** runs.
3. **GET /appointments** (no query) → all appointments.
4. **Client-side filter**: `patientId === logged-in user.id` → then filter by **selected date**.
5. **GET /doctors** + **GET /users** → resolve doctor names.
6. Render list: doctor name, date, slot, token, status (waiting/completed/cancelled), **Cancel** for waiting.
7. **Cancel** → **PATCH /appointments/:id** `{ status: 'cancelled' }` → reload list.

**Why GET /appointments (no params)?**  
json-server’s `?patientId=2` filter can return `[]` even when data exists; fetching all and filtering by `patientId` and date in the browser is reliable.

---

### 4.2 Book Appointment (booking.html)

**Auth & entry**

- **requireAuth(['patient'])** → redirect to login if not patient.
- **initBookingPage()** in patient.js: reads `doctorId` and `date` from URL; if missing or no user → redirect to **patient-dashboard.html**.

**What happens**

1. **GET /doctors/:doctorId** → doctor details.
2. **GET /appointments?doctorId=&lt;id&gt;&date=&lt;date&gt;** → appointments for that doctor/date.
3. Compute available slots (same logic as dashboard): morning/afternoon/evening counts.
4. If **current user already has an appointment** for this doctor+date:
   - Show “You already have an appointment” with token, current token, queue ahead, estimated wait, **Cancel appointment**.
   - Optional: poll **GET /appointments?doctorId=&date=&status=waiting** for current token.
5. If no existing appointment:
   - Show **slot dropdown** (Morning / Afternoon / Evening) and **Book**.
6. On **Book** (doBook):
   - **GET /appointments?doctorId=&date=** again → check no duplicate for this patient.
   - Compute **next token** for chosen slot (max existing token + 1).
   - **POST /appointments** with:
     - `doctorId`, `patientId`, `patientName`, `patientPhone`, `date`, `slot`, `tokenNumber`, `status: 'waiting'`.
   - Show “Appointment booked” with token and estimated wait; optionally poll for current token.

**Navigation**

- “Back to doctors” → **patient-dashboard.html**.

---

## 5. Doctor Flow

### 5.1 Doctor Dashboard (doctor-dashboard.html)

**Auth**

- **requireAuth(['doctor'])** → redirect to **login.html** if not logged in or not doctor.

**Resolving “current doctor”**

- On load: **GET /doctors** → find doctor where `userId === session user.id` (**getDoctorByUserId**).
- If not found → toast “Doctor profile not found.” and stop.
- Store `currentDoctorId` and use it for all API calls on this page.

**UI**

- Date picker (default: today).
- Stats cards: **Total today**, **Waiting**, **Completed**, **Current token**.
- Slot counts: **Morning**, **Afternoon**, **Evening**.
- Table: **Today’s patients** (Token, Patient, Phone, Slot, Status, Action).
- **Update slot availability**: enable/disable and limit per slot; **Save**.

**Data load (loadDoctorDashboard)**

1. **GET /appointments?doctorId=&lt;id&gt;&date=&lt;selectedDate&gt;**.
2. **GET /doctors/:doctorId** (for slot config).
3. From appointments: split into waiting / completed / cancelled; current token = min token among waiting.
4. Update stats and slot counts.
5. Table: all appointments (waiting then completed then cancelled), sorted by token; **Complete** only for status `waiting`.

**Complete button**

- **PATCH /appointments/:id** with `{ status: 'completed' }` → toast “Marked as completed.” → **loadDoctorDashboard** again.

**Slot section**

- For each slot (morning/afternoon/evening): checkbox “Enable”, “Limit” number.
- **Save** → **PATCH /doctors/:doctorId** with updated `slots` → toast and reload.

---

## 6. API & Data (json-server + db.json)

**Base URL:** `http://localhost:3000` (set in js/api.js).

**Endpoints used**

| Action              | Method | Endpoint                    | Body / Query |
|---------------------|--------|-----------------------------|--------------|
| List users          | GET    | /users                      | -            |
| Create user         | POST   | /users                      | user object  |
| List doctors        | GET    | /doctors                    | -            |
| One doctor          | GET    | /doctors/:id                | -            |
| Update doctor       | PATCH  | /doctors/:id                | partial      |
| List appointments   | GET    | /appointments               | ?date=, ?doctorId= (patient list: no params, then filter in JS) |
| Create appointment  | POST   | /appointments              | appointment  |
| Update appointment  | PATCH  | /appointments/:id          | e.g. status  |

**db.json**

- **users**: id, role, name, email, phone, password [, specialist ].
- **doctors**: id, userId, specialist, slots { morning, afternoon, evening } each { start, end, limit, enabled }.
- **appointments**: id, doctorId, patientId, patientName, patientPhone, date, slot, tokenNumber, status (waiting | completed | cancelled).

**Important**

- Patient “My Appointments” does **GET /appointments** (no query) and filters by `patientId` and date in the front-end so data shows even when `?patientId=2` returns `[]`.

---

## 7. Flow Summary (Quick Reference)

```
[ index.html ]
     │
     ├── Login ──► login.html ──► match user in /users ──► setSession ──► doctor-dashboard | patient-dashboard
     │
     └── Sign Up ──► signup.html ──► POST /users [+ POST /doctors if doctor] ──► setSession ──► same dashboards

PATIENT:
  patient-dashboard ──► Doctors tab: GET /doctors, GET /appointments?date= → cards → Book → booking.html
                     ──► My Appointments: GET /appointments → filter by patientId + date → list (+ Cancel → PATCH)
  booking.html ──► GET doctor + appointments → slot choice → POST /appointments → “Booked” (+ optional cancel)

DOCTOR:
  doctor-dashboard ──► GET /doctors (find by userId), GET /appointments?doctorId=&date= → stats + table
                    ──► Complete → PATCH /appointments/:id { status: 'completed' }
                    ──► Slot section → PATCH /doctors/:id { slots }
```

---

## 8. Files Involved

| File                  | Purpose |
|-----------------------|--------|
| index.html            | Landing, links to login/signup |
| login.html            | Login form, handleLogin |
| signup.html           | Signup form, handleSignup |
| patient-dashboard.html| Patient: doctors list + my appointments |
| booking.html          | Patient: book one appointment (slot + POST) |
| doctor-dashboard.html | Doctor: stats, table, complete, slots |
| js/api.js             | API_BASE, request(), getUsers, getDoctors, getAppointments, createAppointment, updateAppointment, getDoctorsWithUser |
| js/auth.js            | getSession, setSession, clearSession, requireAuth, handleLogin, handleSignup |
| js/utils.js           | getToday, formatToken, showToast, showLoading, hideLoading, escapeHtml |
| js/patient.js         | getDoctorsWithSlots, loadPatientDashboard, loadMyAppointments, initBookingPage, doBook |
| js/doctor.js          | loadDoctorDashboard, getDoctorByUserId, slot save, Complete button |
| db.json               | users, doctors, appointments (json-server) |

Running the backend: `json-server --watch db.json --port 3000`.
