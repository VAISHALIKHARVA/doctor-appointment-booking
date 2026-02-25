Create a Doctor Appointment Booking System using:

- HTML
- Tailwind CSS (CDN)
- Normal JavaScript (no frameworks)
- JSON Server as backend

Project Requirements:

AUTH FLOW
1. Login Page
   - Login as Doctor
   - Login as Patient
   - Email + Password
   - Redirect based on role

2. Signup Page
   - Role selection (Doctor / Patient)

   If Patient:
     - Name
     - Email
     - Phone
     - Password
     - Confirm Password
     - Show/Hide password toggle (eye icon)

   If Doctor:
     - Name
     - Specialist
     - Email
     - Phone
     - Password
     - Confirm Password
     - Default Slots:
        Morning (9AM–12PM)
        Afternoon (1PM–4PM)
        Evening (5PM–8PM)

BACKEND (JSON SERVER)
- users (both doctor and patient)
- doctors (profile + slot config)
- appointments

DOCTOR FLOW

Doctor Dashboard:
- Show total patients today
- Show current patient number
- Show:
    - Morning total
    - Afternoon total
    - Evening total
- Table of:
    - Waiting Patients
    - Completed Patients
- Ability to:
    - Update slot availability
    - Mark patient as completed
    - View patient details

PATIENT FLOW

Patient Dashboard:
- Show doctor list as cards
- Each card:
    - Name
    - Specialist
    - Available slots
    - Book button

On Book:
- Show current token number
- Show patient queue count
- Save appointment
- If already booked, show appointment details instead

GENERAL RULES:
- Use localStorage for login session
- Use fetch API
- Clean reusable JS functions
- Modular structure
- Responsive Tailwind UI
- No frameworks

Generate:
- Folder structure
- All HTML pages
- All JS files
- db.json example
- Step to run JSON server
```

---

# ✅ 2️⃣ PROJECT STRUCTURE (Recommended)

```
doctor-appointment/
│
├── index.html (login)
├── signup.html
├── patient-dashboard.html
├── doctor-dashboard.html
├── booking.html
│
├── js/
│   ├── auth.js
│   ├── doctor.js
│   ├── patient.js
│   ├── api.js
│   └── utils.js
│
├── db.json
└── README.md
```

---

# ✅ 3️⃣ JSON SERVER SETUP

Install:

```bash
npm install -g json-server
```

Run:

```bash
json-server --watch db.json --port 3000
```

API Base URL:

```
http://localhost:3000
```

---

# ✅ 4️⃣ FULL db.json EXAMPLE

Here is a clean professional structure:

```json
{
  "users": [
    {
      "id": 1,
      "role": "doctor",
      "name": "Dr. Amit Sharma",
      "specialist": "Cardiologist",
      "email": "doctor1@gmail.com",
      "phone": "9876543210",
      "password": "123456"
    },
    {
      "id": 2,
      "role": "patient",
      "name": "Rahul Patel",
      "email": "patient1@gmail.com",
      "phone": "9999999999",
      "password": "123456"
    }
  ],
  "doctors": [
    {
      "id": 1,
      "userId": 1,
      "specialist": "Cardiologist",
      "slots": {
        "morning": {
          "start": "09:00",
          "end": "12:00",
          "limit": 5
        },
        "afternoon": {
          "start": "13:00",
          "end": "16:00",
          "limit": 5
        },
        "evening": {
          "start": "17:00",
          "end": "20:00",
          "limit": 5
        }
      }
    }
  ],
  "appointments": [
    {
      "id": 1,
      "doctorId": 1,
      "patientId": 2,
      "patientName": "Rahul Patel",
      "patientPhone": "9999999999",
      "date": "2026-02-24",
      "slot": "morning",
      "tokenNumber": 1,
      "status": "waiting"
    }
  ]
}
```

---

# ✅ 5️⃣ API ENDPOINT STRUCTURE

| Action             | API                               |
| ------------------ | --------------------------------- |
| Get users          | GET /users                        |
| Create user        | POST /users                       |
| Get doctors        | GET /doctors                      |
| Get appointments   | GET /appointments                 |
| Book appointment   | POST /appointments                |
| Update appointment | PATCH /appointments/:id           |
| Filter by doctor   | GET /appointments?doctorId=1      |
| Filter by date     | GET /appointments?date=2026-02-24 |

---

# ✅ 6️⃣ DOCTOR DASHBOARD LOGIC

### Total Patients Today

```
GET /appointments?doctorId=1&date=TODAY
```

### Current Patient Number

Find:

* Lowest token where status = waiting

### Completed Count

Filter:

```
status = completed
```

---

# ✅ 7️⃣ PATIENT BOOKING LOGIC

Before booking:

1. Check:

```
GET /appointments?doctorId=1&patientId=2&date=TODAY
```

If exists → show appointment details

If not:

* Get existing appointments of doctor
* Count tokens for selected slot
* Assign next token number

---

# ✅ 8️⃣ UI IMPROVEMENT SUGGESTIONS (Important 💡)

Instead of boring UI, use:

### ✅ Doctor Dashboard Layout

```
--------------------------------
| Welcome Dr. Name            |
--------------------------------
| Total | Waiting | Completed |
--------------------------------
| Morning | Afternoon | Evening|
--------------------------------
| Today's Patients Table      |
--------------------------------
```

Use:

* Tailwind Cards
* Color codes:

  * Waiting → Yellow
  * Completed → Green
  * Cancelled → Red

---

### ✅ Doctor Card UI (Patient Side)

Card Design:

```
[ Dr. Name ]
Specialist
Morning Slots: 3 Available
Afternoon Slots: 2 Available
Evening Slots: Full
[ Book Appointment ]
```

Hover effect:

```
hover:shadow-xl hover:scale-105 transition
```

---

### ✅ Token System Better Idea

Instead of simple number,
Display:

```
Your Token: A12
Current Token: A09
Estimated Wait Time: 20 min
```

You can calculate:

```
waitTime = (yourToken - currentToken) * 10 minutes
```

---

# ✅ 9️⃣ Smart Enhancements (Optional but Professional)

If you want more professional system:

* Add appointment cancellation
* Add doctor availability toggle (Enable/Disable slot)
* Add search doctor by specialist
* Add pagination
* Add date selection
* Add loading spinners
* Add Toast notifications

---

# 🔟 FINAL SYSTEM FLOW

LOGIN →
ROLE CHECK →
REDIRECT →

Doctor →
Dashboard →
Manage Slots →
View Patients →
Update Status

Patient →
Doctor List →
Book →
See Token →
Track Appointment

---

# 🎯 This Plan is Production-Level for Internship / Portfolio

If you build exactly this:

* It becomes strong portfolio project
* Shows CRUD
* Shows role-based auth
* Shows slot logic
* Shows token logic
* Shows dashboard analytics

---

If you want next step, I can now give you:

* 📌 Complete database logic explanation
* 📌 Appointment token algorithm code
* 📌 Full professional UI wireframe plan
* 📌 OR Step-by-step building guide (Day 1 to Day 5 roadmap)

Tell me which one you want next 🚀
Perfect 👍
I’ll give you a **clear, structured MASTER PROMPT** that you can paste directly into **Cursor AI** so it generates your full Doctor Appointment Booking System using:

* ✅ HTML
* ✅ Tailwind CSS
* ✅ Normal JavaScript (no framework)
* ✅ JSON Server (fake REST API)

Then I’ll give you:

* 📁 Proper folder structure
* 🗄 Full JSON example (db.json)
* 🔄 API structure
* 💡 UI improvement suggestions

---

# ✅ 1️⃣ MASTER PROMPT FOR CURSOR AI

You can paste this in Cursor:

---

```
Create a Doctor Appointment Booking System using:

- HTML
- Tailwind CSS (CDN)
- Normal JavaScript (no frameworks)
- JSON Server as backend

Project Requirements:

AUTH FLOW
1. Login Page
   - Login as Doctor
   - Login as Patient
   - Email + Password
   - Redirect based on role

2. Signup Page
   - Role selection (Doctor / Patient)

   If Patient:
     - Name
     - Email
     - Phone
     - Password
     - Confirm Password
     - Show/Hide password toggle (eye icon)

   If Doctor:
     - Name
     - Specialist
     - Email
     - Phone
     - Password
     - Confirm Password
     - Default Slots:
        Morning (9AM–12PM)
        Afternoon (1PM–4PM)
        Evening (5PM–8PM)

BACKEND (JSON SERVER)
- users (both doctor and patient)
- doctors (profile + slot config)
- appointments

DOCTOR FLOW

Doctor Dashboard:
- Show total patients today
- Show current patient number
- Show:
    - Morning total
    - Afternoon total
    - Evening total
- Table of:
    - Waiting Patients
    - Completed Patients
- Ability to:
    - Update slot availability
    - Mark patient as completed
    - View patient details

PATIENT FLOW

Patient Dashboard:
- Show doctor list as cards
- Each card:
    - Name
    - Specialist
    - Available slots
    - Book button

On Book:
- Show current token number
- Show patient queue count
- Save appointment
- If already booked, show appointment details instead

GENERAL RULES:
- Use localStorage for login session
- Use fetch API
- Clean reusable JS functions
- Modular structure
- Responsive Tailwind UI
- No frameworks

Generate:
- Folder structure
- All HTML pages
- All JS files
- db.json example
- Step to run JSON server
```

---

# ✅ 2️⃣ PROJECT STRUCTURE (Recommended)

```
doctor-appointment-booking/
│
├── index.html (login)
├── signup.html
├── patient-dashboard.html
├── doctor-dashboard.html
├── booking.html
│
├── js/
│   ├── auth.js
│   ├── doctor.js
│   ├── patient.js
│   ├── api.js
│   └── utils.js
│
├── db.json
└── README.md
```

---

# ✅ 3️⃣ JSON SERVER SETUP

Install:

```bash
npm install -g json-server
```

Run:

```bash
json-server --watch db.json --port 3000
```

API Base URL:

```
http://localhost:3000
```

---

# ✅ 4️⃣ FULL db.json EXAMPLE

Here is a clean professional structure:

```json
{
  "users": [
    {
      "id": 1,
      "role": "doctor",
      "name": "Dr. Amit Sharma",
      "specialist": "Cardiologist",
      "email": "doctor1@gmail.com",
      "phone": "9876543210",
      "password": "123456"
    },
    {
      "id": 2,
      "role": "patient",
      "name": "Rahul Patel",
      "email": "patient1@gmail.com",
      "phone": "9999999999",
      "password": "123456"
    }
  ],
  "doctors": [
    {
      "id": 1,
      "userId": 1,
      "specialist": "Cardiologist",
      "slots": {
        "morning": {
          "start": "09:00",
          "end": "12:00",
          "limit": 5
        },
        "afternoon": {
          "start": "13:00",
          "end": "16:00",
          "limit": 5
        },
        "evening": {
          "start": "17:00",
          "end": "20:00",
          "limit": 5
        }
      }
    }
  ],
  "appointments": [
    {
      "id": 1,
      "doctorId": 1,
      "patientId": 2,
      "patientName": "Rahul Patel",
      "patientPhone": "9999999999",
      "date": "2026-02-24",
      "slot": "morning",
      "tokenNumber": 1,
      "status": "waiting"
    }
  ]
}
```

---

# ✅ 5️⃣ API ENDPOINT STRUCTURE

| Action             | API                               |
| ------------------ | --------------------------------- |
| Get users          | GET /users                        |
| Create user        | POST /users                       |
| Get doctors        | GET /doctors                      |
| Get appointments   | GET /appointments                 |
| Book appointment   | POST /appointments                |
| Update appointment | PATCH /appointments/:id           |
| Filter by doctor   | GET /appointments?doctorId=1      |
| Filter by date     | GET /appointments?date=2026-02-24 |

---

# ✅ 6️⃣ DOCTOR DASHBOARD LOGIC

### Total Patients Today

```
GET /appointments?doctorId=1&date=TODAY
```

### Current Patient Number

Find:

* Lowest token where status = waiting

### Completed Count

Filter:

```
status = completed
```

---

# ✅ 7️⃣ PATIENT BOOKING LOGIC

Before booking:

1. Check:

```
GET /appointments?doctorId=1&patientId=2&date=TODAY
```

If exists → show appointment details

If not:

* Get existing appointments of doctor
* Count tokens for selected slot
* Assign next token number

---

# ✅ 8️⃣ UI IMPROVEMENT SUGGESTIONS (Important 💡)

Instead of boring UI, use:

### ✅ Doctor Dashboard Layout

```
--------------------------------
| Welcome Dr. Name            |
--------------------------------
| Total | Waiting | Completed |
--------------------------------
| Morning | Afternoon | Evening|
--------------------------------
| Today's Patients Table      |
--------------------------------
```

Use:

* Tailwind Cards
* Color codes:

  * Waiting → Yellow
  * Completed → Green
  * Cancelled → Red

---

### ✅ Doctor Card UI (Patient Side)

Card Design:

```
[ Dr. Name ]
Specialist
Morning Slots: 3 Available
Afternoon Slots: 2 Available
Evening Slots: Full
[ Book Appointment ]
```

Hover effect:

```
hover:shadow-xl hover:scale-105 transition
```

---

### ✅ Token System Better Idea

Instead of simple number,
Display:

```
Your Token: A12
Current Token: A09
Estimated Wait Time: 20 min
```

You can calculate:

```
waitTime = (yourToken - currentToken) * 10 minutes
```

---

# ✅ 9️⃣ Smart Enhancements (Optional but Professional)

If you want more professional system:

* Add appointment cancellation
* Add doctor availability toggle (Enable/Disable slot)
* Add search doctor by specialist
* Add pagination
* Add date selection
* Add loading spinners
* Add Toast notifications

---

# 🔟 FINAL SYSTEM FLOW

LOGIN →
ROLE CHECK →
REDIRECT →

Doctor →
Dashboard →
Manage Slots →
View Patients →
Update Status

Patient →
Doctor List →
Book →
See Token →
Track Appointment