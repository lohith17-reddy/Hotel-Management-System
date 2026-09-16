# 🏨 Hostel Management System

### Campus Residence & Operations Management with AI-Powered Food Waste Prediction

A modern full-stack **College Hostel Management System** designed to digitize hostel operations, student services, room and bed allocation, attendance, leave management, visitor tracking, complaints, fees, inventory, announcements, auditing, and AI-assisted food waste management.

The application provides dedicated role-based portals for **Students, Wardens, Administrators, and Staff**, with an integrated AI assistant powered by **Google Gemini** and a smart food-waste prediction module.

---

## ✨ Highlights

* 🔐 Role-based authentication for Students, Wardens, Admins, and Staff
* 🏢 Hostel, block, room, and bed management
* 🛏️ Student room and bed allocation
* 🔄 Room transfer requests and approvals
* 👨‍🎓 Student profile and directory management
* 📋 Attendance and daily roll-call management
* 🚪 Outstation leave / gate-pass management
* 👥 Visitor registration and checkout tracking
* 💳 Hostel and mess fee management
* 🧾 Payment and receipt records
* 🛠️ Complaint and maintenance management
* 📢 Announcements and notifications
* 📦 Inventory and hostel asset tracking
* 📝 Audit logging for important operations
* 🍽️ Smart meal attendance and food-waste prediction
* 🤖 AI-powered resident assistant
* 🧠 AI-assisted complaint classification and priority detection
* 📊 Executive dashboards with hostel and operational statistics
* 📱 Responsive UI for desktop and mobile screens

---

# 🎯 Project Overview

Managing a college hostel involves much more than assigning rooms.

Administrators and wardens need to manage:

* Students
* Hostels
* Blocks
* Rooms
* Beds
* Allocations
* Transfers
* Attendance
* Leave requests
* Visitors
* Fees
* Complaints
* Inventory
* Announcements
* Mess attendance
* Food preparation
* Food wastage
* Operational audits

This project brings these workflows together into a single web application.

The system is designed around **role-specific dashboards**, so every user sees the modules relevant to their responsibilities.

The frontend implements separate navigation and access rules for different roles, while the Express backend contains services and API endpoints for the corresponding operations.

---

# 👥 User Roles

## 🎓 Student

Students can access their own residence-related services.

### Student features

* Personal dashboard
* View assigned hostel, room, and bed
* Request room transfers
* Smart meal opt-in
* View food-waste information
* Submit complaints
* Apply for outstation leave
* View fees and payment records
* Visitor management
* Hostel announcements
* AI resident assistant

The student portal exposes modules such as **My Room & Bed, Room Transfer, Smart Meal Opt-In, Outstation Gate Pass, Repair Tickets, Fees & Receipts, Visitor Passes, and Hostel Notices**.

---

## 🧑‍💼 Warden

Wardens receive hostel-level operational controls.

### Warden features

* Warden dashboard
* Assigned hostel management
* Room and bed grid
* Bed allocation
* Room transfer approvals
* Student roster
* Attendance / roll call
* Leave request review
* Visitor logs
* Food-waste monitoring
* Maintenance triage
* Announcements
* Inventory and asset tracking

Wardens are also designed to operate within their assigned hostel scope where hostel-level authorization is applied.

---

## 👨‍💻 Administrator

Administrators have the broadest operational access.

### Admin features

* Executive dashboard
* Hostel and block management
* Room and bed management
* Student directory
* Room allocations
* Transfers
* Attendance
* Leave requests
* Visitor registry
* Food-waste AI
* Complaints and maintenance
* Fees and payments
* Announcements
* Inventory
* Audit logs
* System-wide management

The frontend explicitly treats the admin role as having access to the complete application navigation.

---

## 🧑‍🔧 Staff

The system also defines a staff role with access to operational modules such as:

* Dashboard
* Complaints
* Food waste
* Inventory
* Announcements

The role is represented in the shared TypeScript domain model and frontend authorization logic.

---

# 🤖 AI Features

## 1. AI Resident Assistant

The application includes an interactive AI assistant that can answer common hostel-related questions.

Example topics include:

* Room transfer procedures
* Mess timings
* Food-waste policies
* Leave policies
* Visitor rules
* Hostel procedures
* Fee-related questions

The assistant is exposed through a dedicated modal in the authenticated application.

---

## 2. AI Complaint Classification

When submitting a complaint, users can provide a title and description.

The backend can use Gemini to automatically determine:

* Complaint category
* Complaint priority

This reduces manual classification for hostel administrators and wardens.

---

## 3. Food Waste Prediction

One of the major features of the project is **AI-assisted food-waste management**.

The system considers:

* Number of active students
* Approved leave requests
* Meal attendance
* Meal preferences
* Breakfast attendance
* Lunch attendance
* Dinner attendance

It then generates meal predictions and food requirements for a selected date.

### Food-waste module capabilities

* Daily meal prediction
* Meal attendance tracking
* Food preparation records
* Food waste tracking
* Waste insights
* Accuracy metrics
* Ingredient estimation
* Food-waste settings
* Meal opt-in / opt-out

The backend exposes dedicated food-waste dashboard, prediction, preparation, meal-attendance, ingredient-estimation, and accuracy endpoints.

---

# 🏗️ System Architecture

```text
┌───────────────────────────────────────────────┐
│                  Frontend                     │
│                                               │
│ React 19 + TypeScript + Tailwind CSS          │
│ Vite + Lucide + Recharts + Motion             │
└──────────────────────┬────────────────────────┘
                       │
                       │ REST API
                       ▼
┌───────────────────────────────────────────────┐
│                 Express Server                │
│                                               │
│ Authentication                                │
│ Role Authorization                             │
│ Hostel Management                             │
│ Allocation Services                            │
│ Fee & Payment Management                       │
│ Complaint Management                           │
│ Leave Management                               │
│ Visitor Management                             │
│ Attendance                                     │
│ Food Waste Services                            │
│ Gemini AI Integration                          │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│             File-Based Data Layer             │
│                                               │
│ data/hostel_database.json                     │
│                                               │
│ Seeded using server/db/seedData.ts            │
└───────────────────────────────────────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  Google Gemini   │
              │      AI API      │
              └──────────────────┘
```

The application runs the Express server and Vite middleware together in development, while the production build serves the generated frontend from `dist`.

---

# 🛠️ Technology Stack

## Frontend

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| React 19        | User interface            |
| TypeScript      | Type safety               |
| Vite            | Development/build tooling |
| Tailwind CSS    | Styling                   |
| Lucide React    | Icons                     |
| Recharts        | Data visualization        |
| Motion          | Animations                |
| Canvas Confetti | UI effects                |

The project's dependencies include React 19, Vite, Tailwind CSS, Recharts, Motion, Lucide React, and related tooling.

## Backend

| Technology       | Purpose                   |
| ---------------- | ------------------------- |
| Node.js          | Runtime                   |
| Express.js       | REST API                  |
| TypeScript       | Backend type safety       |
| dotenv           | Environment configuration |
| Google GenAI SDK | Gemini integration        |

## Data Storage

The current implementation uses a lightweight JSON-based persistence layer:

```text
data/
└── hostel_database.json
```

The database engine automatically creates the data directory, loads the JSON database when it exists, and falls back to the initial seed data when needed.

---

# 📂 Project Structure

```text
Hotel-Management-System/
│
├── assets/
│   └── .aistudio/
│
├── data/
│   └── hostel_database.json
│
├── server/
│   ├── db/
│   │   ├── database.ts
│   │   └── seedData.ts
│   │
│   ├── middleware/
│   │   └── authMiddleware.ts
│   │
│   ├── routes/
│   │   └── api.ts
│   │
│   └── services/
│       ├── allocationService.ts
│       ├── authService.ts
│       ├── foodWasteService.ts
│       └── geminiService.ts
│
├── src/
│   ├── components/
│   │   ├── ai/
│   │   ├── allocations/
│   │   ├── announcements/
│   │   ├── attendance/
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── complaints/
│   │   ├── dashboard/
│   │   ├── fees/
│   │   ├── foodWaste/
│   │   ├── hostels/
│   │   ├── inventory/
│   │   ├── landing/
│   │   ├── layout/
│   │   ├── leaves/
│   │   ├── students/
│   │   └── visitors/
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── services/
│   │   └── apiClient.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── server.ts
```

---

# 🔐 Authentication & Authorization

The project implements role-aware authentication and authorization.

Supported roles:

```text
admin
warden
staff
student
```

Authentication state is maintained on the frontend using an `AuthContext`, with the session token and user ID stored in browser local storage.

The backend includes middleware for:

* Authentication
* Role authorization
* Hostel-level access control

The role authorization layer allows administrators to operate globally while restricting other roles according to their permissions.

---

# 🛏️ Room & Bed Allocation

The allocation system includes validation to prevent common hostel-management errors.

When allocating a student, the backend checks:

* Whether the student exists
* Whether the student already has an active allocation
* Whether the selected bed exists
* Whether the selected bed is already occupied
* Whether the room has reached capacity

After a successful allocation, the system:

1. Creates the allocation record
2. Marks the bed as occupied
3. Updates the student's hostel assignment
4. Recalculates room and hostel occupancy
5. Creates a notification
6. Creates an audit log

This logic is implemented in `AllocationService`.

---

# 💳 Fees & Payments

The system supports:

* Hostel rent
* Mess fees
* Fee records
* Payment records
* Payment status
* Transaction IDs
* Receipt numbers
* Payment methods

The API provides endpoints to create and retrieve fees and payments and updates fee payment state as transactions are recorded.

---

# 📝 Complaints & Maintenance

Students can submit complaints containing:

* Title
* Description
* Category
* Priority
* Room information

The system can automatically classify complaint category and priority using Gemini when those values are not explicitly provided.

---

# 🚪 Leave Management

Students can submit outstation leave requests.

Leave records include:

* Student
* Dates
* Reason
* Destination
* Contact information
* Emergency contact
* Approval status

Wardens can approve or reject requests.

When a leave request is approved, the food-waste prediction engine is recalculated for the relevant leave dates, connecting resident leave activity with mess planning.

---

# 👥 Visitor Management

The visitor module supports:

* Visitor registration
* Student association
* Room information
* Check-in
* Check-out
* Visitor status tracking

Checkout automatically records the visitor's exit time.

---

# 📊 Dashboard & Analytics

The backend provides dashboard statistics such as:

* Total students
* Active students
* Wardens
* Staff
* Hostels
* Blocks
* Rooms
* Occupied rooms
* Available rooms
* Total beds
* Occupied beds
* Available beds
* Occupancy percentage
* Pending complaints
* Pending leave requests
* Pending transfers
* Outstanding payments
* Maintenance requests
* Predicted meals
* Food waste
* Food waste cost

These metrics are aggregated by the dashboard API and presented through the frontend dashboard.

---

# 🧾 Audit Logging

Important system operations create audit records.

Examples include:

* Authentication actions
* Room allocations
* Administrative operations
* Entity changes

This provides a history of operational activities and helps with accountability and debugging.

---

# 📡 API Overview

The backend exposes REST-style endpoints under:

```text
/api
```

### Authentication

```text
POST /api/student/signup
POST /api/student/login

POST /api/warden/signup
POST /api/warden/login

POST /api/admin/signup
POST /api/admin/login

POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
GET  /api/auth/me
```

### Hostel Management

```text
GET  /api/hostels
POST /api/hostels

GET  /api/blocks
POST /api/blocks

GET  /api/rooms
POST /api/rooms

GET  /api/beds
```

### Students

```text
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
```

### Allocations & Transfers

```text
GET  /api/allocations
POST /api/allocations

PUT /api/allocations/:id/deallocate

GET  /api/transfers
POST /api/transfers

PUT /api/transfers/:id/approve
PUT /api/transfers/:id/reject
```

### Fees & Payments

```text
GET  /api/fees
POST /api/fees

GET  /api/payments
POST /api/payments
```

### Complaints

```text
GET  /api/complaints
POST /api/complaints
PUT  /api/complaints/:id
```

### Leave Management

```text
GET  /api/leaves
POST /api/leaves

PUT /api/leaves/:id/approve
PUT /api/leaves/:id/reject
```

### Visitors

```text
GET  /api/visitors
POST /api/visitors

PUT /api/visitors/:id/checkout
```

### Attendance

```text
GET  /api/attendance
POST /api/attendance
```

### Announcements & Notifications

```text
GET  /api/announcements
POST /api/announcements

GET /api/notifications
PUT /api/notifications/:id/read
```

### Inventory & Audit

```text
GET  /api/inventory
POST /api/inventory

GET /api/audit-logs
```

### Dashboard

```text
GET /api/dashboard/stats
```

### Food Waste

```text
GET  /api/food-waste/dashboard
GET  /api/food-waste/predictions
POST /api/food-waste/predict

GET  /api/food-waste/preparations
POST /api/food-waste/preparations

GET  /api/food-waste/meal-attendance
POST /api/food-waste/meal-attendance

GET /api/food-waste/ingredients-estimate
GET /api/food-waste/accuracy
```

These routes are implemented in the project's main Express API router.

---

# ⚙️ Local Setup

## Prerequisites

Make sure you have installed:

* **Node.js**
* **npm** or **Bun**
* A **Google Gemini API key** for AI functionality

---

## 1. Clone the repository

```bash
git clone https://github.com/lohith17-reddy/Hotel-Management-System.git
cd Hotel-Management-System
```

---

## 2. Install dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

The project includes a `bun.lock` file and npm-compatible scripts in `package.json`.

---

## 3. Configure environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Configure:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

The repository's `.env.example` defines `GEMINI_API_KEY` for Gemini API calls and `APP_URL` for application URL configuration.

> Never commit your real API keys or secrets to GitHub.

---

## 4. Start the development server

```bash
npm run dev
```

The application starts on:

```text
http://localhost:3000
```

The Express entry point listens on port `3000` and mounts the REST API under `/api`.

---

# 🏗️ Production Build

Build the application with:

```bash
npm run build
```

The build script:

1. Builds the Vite frontend
2. Bundles the Express server using esbuild
3. Produces the production server inside `dist`

Start the production server:

```bash
npm start
```

These scripts are defined in `package.json`.

---

# 🧪 Type Checking

Run the project's TypeScript validation with:

```bash
npm run lint
```

The current `lint` script performs:

```bash
tsc --noEmit
```

so it checks the project for TypeScript compilation/type errors without producing build files.

---

# 🌱 Seed Data

The system contains initial demonstration data.

The database layer uses:

```text
server/db/seedData.ts
```

to initialize the system when a persistent JSON database does not already exist.

The database is stored at:

```text
data/hostel_database.json
```

and the application automatically loads or creates this file during startup.

---

# 🔑 Demo Access

The application includes one-click demo access for three roles.

### Student

```text
Email: student.demo@campus.edu
Password: student123
```

### Warden

```text
Email: warden.demo@campus.edu
Password: warden123
```

### Admin

```text
Email: admin.demo@campus.edu
Password: admin123
```

The application itself displays these demo accounts on the landing page and exposes demo-login functionality through the authentication service.

> These accounts are intended for demonstration/testing and should not be used as production credentials.

---

# 🖥️ Application Routes

The frontend provides dedicated authentication routes:

```text
/student/login
/student/signup

/warden/login
/warden/signup

/admin/login
/admin/signup
```

and role-based dashboard routes:

```text
/student/dashboard
/warden/dashboard
/admin/dashboard
```

The main application synchronizes these routes with the authenticated user's role.

---

# 🔄 Core Workflow

A typical hostel workflow looks like this:

```text
Student Registration
        │
        ▼
Authentication
        │
        ▼
Student Profile
        │
        ▼
Room / Bed Allocation
        │
        ▼
Residence Services
 ┌──────┼────────┬─────────┐
 ▼      ▼        ▼         ▼
Leave  Fees  Complaints  Visitors
 │
 ▼
Mess / Meal Attendance
 │
 ▼
AI Food Demand Prediction
 │
 ▼
Food Preparation
 │
 ▼
Food Waste Tracking
 │
 ▼
Management Insights
```

---

# 🔒 Security Considerations

This repository is primarily structured as an educational/demo full-stack application.

Before using it in a real production environment, the authentication and infrastructure should be hardened.

Areas to improve for production deployment include:

* Use a production-grade password hashing algorithm such as Argon2 or bcrypt
* Use cryptographically secure, signed access tokens
* Add token expiration and refresh-token handling
* Add stronger API validation
* Add rate limiting
* Add CSRF/CORS protections where appropriate
* Add secure HTTP headers
* Store secrets in a proper secrets manager
* Replace demo credentials
* Move from JSON persistence to a production database
* Add automated tests
* Add structured logging and monitoring

The current authentication implementation uses a custom token/session design and JSON persistence, which is suitable for demonstrating application workflows but should not be treated as a production security architecture without further hardening.

---

# 🚀 Future Improvements

Potential next-stage improvements include:

* PostgreSQL or MySQL database
* Prisma / Drizzle / TypeORM integration
* Redis caching
* Proper JWT + refresh-token authentication
* Email verification
* Password reset emails
* OTP-based authentication
* Advanced role/permission management
* Real payment gateway integration
* Real-time notifications using WebSockets
* QR-based visitor management
* QR-based student attendance
* Mobile application
* Advanced food-demand forecasting models
* Historical food-waste analytics
* Predictive maintenance
* Hostel occupancy forecasting
* Automated reports
* Docker deployment
* CI/CD pipeline
* Automated backend and frontend testing

---

# 📈 Learning & Development Goals

This project demonstrates practical implementation of:

* Full-stack web development
* React architecture
* TypeScript
* REST API design
* Express.js backend development
* Role-based access control
* Authentication workflows
* CRUD operations
* Data modeling
* State management
* AI API integration
* Predictive application features
* Dashboard development
* Responsive UI design
* File-based persistence
* Service-layer architecture

It can also serve as a foundation for extending the project into a production-grade **Campus Residential Management Platform**.

---

# 🤝 Contributing

Contributions are welcome.

A typical contribution workflow:

```bash
# Fork the repository

git clone <your-fork-url>

cd Hotel-Management-System

npm install

# Create a feature branch
git checkout -b feature/your-feature

# Make your changes

# Check TypeScript
npm run lint

# Build the project
npm run build

# Commit
git add .
git commit -m "feat: add your feature"

# Push
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📄 License

No explicit open-source license is currently specified in the repository.

Before using this project commercially or redistributing it, add an appropriate `LICENSE` file and define the project's licensing terms.

---

# 👨‍💻 Author

**Lohith Reddy**

GitHub:

👉 https://github.com/lohith17-reddy

Repository:

👉 https://github.com/lohith17-reddy/Hotel-Management-System

---

# ⭐ Project

If this project helped you or you found the architecture interesting, consider giving the repository a ⭐ on GitHub.

Built with:

**React + TypeScript + Express + Tailwind CSS + Gemini AI**

for modern college hostel and campus-residence management.
