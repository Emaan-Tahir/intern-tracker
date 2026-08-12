Intern Tracker

A full-stack internship management platform. Admins onboard interns, assign tasks with resources, and review submissions. Interns track their tasks, submit work, and follow their weekly progress and activity.

Built with the MERN stack (MongoDB, Express, React, Node.js).

Features

Admin

Invite-based intern onboarding (email invite → intern sets their own password)
Create and assign tasks with due dates, points, and resource links
Review submissions — approve or request changes, with feedback
View intern roster with live progress percentages

Intern

Role-based dashboard showing only assigned tasks
Submit work via link, view admin feedback
"This week" activity view — streaks, active days, daily time chart, and a "next up" task recommendation
Clickable resource links attached to each task

Shared

JWT authentication with role-based access control (admin / intern)
Collapsible sidebar navigation, shared between both dashboards
Responsive layout with a mobile drawer
Tech stack
Layer	Technology
Frontend	React (Vite), React Router, Axios
Backend	Node.js, Express
Database	MongoDB (Atlas) via Mongoose
Project structure
intern-tracker/
├── client/               React frontend (Vite)
│   └── src/
│       ├── pages/         Login, Admin dashboard, Intern dashboard, This Week, Accept Invite
│       ├── features/auth/ Auth context (login state, JWT handling)
│       ├── shared/        Sidebar, DashboardLayout, ProtectedRoute
│       ├── styles/        theme.css (palette/variables), components.css (shared classes)
│       └── lib/axios.js   API client
│
└── server/               Express backend
    └── src/
        ├── models/         User, Task, Submission, ActivityLog
        ├── controllers/    Auth, intern, task, activity logic
        ├── routes/         API route definitions
        ├── middleware/     JWT auth + role-based access control
        └── utils/          Email sending, activity logging, token generation
Getting started locally
Prerequisites
Node.js (v18+)
A MongoDB Atlas account (free tier works)
A Resend account (free tier works, for invite emails)
1. Clone and install
bash
git clone https://github.com/Emaan-Tahir/intern-tracker.git
cd intern-tracker

Backend:

bash
cd server
npm install
cp .env.example .env

Fill in .env with your MongoDB connection string, a JWT secret, and your Resend API key.

Frontend:

bash
cd ../client
npm install
cp .env.example .env

By default this points at http://localhost:5000/api for local development.

2. Seed the first admin account
bash
cd ../server
npm run seed

This creates a root admin (admin@company.com / admin123) — change the password after first login.

3. Run both servers

Terminal 1 — backend:

bash
cd server
npm run dev

Terminal 2 — frontend:

bash
cd client
npm run dev

Visit http://localhost:5173/login.

Environment variables

server/.env

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key

client/.env

VITE_API_URL=http://localhost:5000/api
Deployment
Frontend: deployed on Vercel, root directory client
Backend: deployed on Render, root directory server
Database: MongoDB Atlas

When deploying, set VITE_API_URL (client) to the deployed backend URL, and CLIENT_URL (server) to the deployed frontend URL so CORS allows requests correctly.

Roles
Role	Created by	Access
Admin	Seed script (first one) or invited by another admin	Onboard interns, create tasks, review submissions
Intern	Invited by an admin via email	View assigned tasks, submit work, view own activity
License

This project is for educational purposes.
Auth	JWT, bcrypt
Email	Resend (invite emails)
Icons	lucide-react
