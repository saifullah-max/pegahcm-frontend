**PegaHCM:**

A Human Capital Management (HCM) system built with Node.js, Prisma, MySQL, and React, designed for HR operations, employee management, payroll, attendance tracking, and role-based access control (RBAC).

**📌 Features:**

1-Role-Based Access Control (RBAC)
    -Admin and Sub-Roles with custom permissions.
    -Permission-based route access (view, create, update, delete).
    -Hierarchical approval system for sub-roles.

2-Employee Management
    -Add, edit, delete employees with full details.
    -Profile management (image, phone, email updates).
    -Salary management with password-protected salary slips.

3-Attendance Management
    -Check-in, check-out system.
    -Attendance overview dashboard with charts.
    -Break management and attendance summaries (daily, monthly).

4-Leave Management
    -Apply for leave, view leave history.
    -Admin approval/rejection with role-based permissions.

5-Payroll Management
    -Monthly salary slips generation with security.
    -Salary auto-copy feature for next month.

6-Notifications System
    =Real-time notifications using Socket.IO.
    -Notification history with read/unread status.
    -Auto-delete old notifications using node-cron.

7-Assets & Document Management
    -Upload employee documents & images.
    -Assets assignment to employees with CRUD operations.

8-Dashboard & Analytics
    -HR and Admin dashboards with attendance stats.
    -Department-wise and overall analytics with charts.

9-Other Features
    -Onboarding process (simplified later).
    -Reset/forgot password implementation.
    -Multi-theme UI improvements.

**🛠 Tech Stack:**

**Backend:**
Node.js (Express)
Prisma ORM
MySQL Database

**Frontend:**
React.js (with role-based navigation)

**Other Integrations:**
Socket.IO → Real-time notifications
Node-cron → Automated cleanup tasks
Bcrypt → Password hashing
JWT → Authentication

**📂 Project Structure**
pegahcm-backend/
├── prisma/                 # Prisma schema & migrations
├── src/
│   ├── controllers/        # API Controllers
│   ├── middlewares/        # Auth & permission checks
│   ├── routes/             # API routes
│   ├── utils/              # Notification, prisma helper, etc.
│   ├── models/             # Prisma models
│   └── index.ts            # Entry point
└── package.json

🚀 Setup Instructions
1. Clone the Repository
git clone <repo-url>
cd pegahcm-backend

2. Install Dependencies
npm install

3. Configure Environment Variables
4. 
Create a .env file in the root directory with:
DATABASE_URL="mysql://username:password@host:port/dbname"
JWT_SECRET="your-secret"
FRONTEND_URl="localhost or deployed frontend URL"

5. Run Prisma Migrations
npx prisma migrate deploy

6. Seed Database (Admin Role, User & Permissions)
npx prisma db seed

This will:
Create Admin role
Create Admin user (email: admin@example.com, password: admin123)
Assign default permissions

6. Start Server
npm run dev

🌐 Key Modules

/auth → Login, signup, reset password
/employees → Employee CRUD
/attendance → Check-in, check-out
/leaves → Leave request & approval
/payroll → Salary management & slips
/notifications → Real-time notifications via Socket.IO
/permissions → Role & permission management

📊 Future Enhancements

Multi-tenancy support
Performance optimization
Complete audit logging
Advanced analytics with AI insights

👨‍💻 Author

Developed by: Saifullah Ahmed
Role: Full Stack Developer
