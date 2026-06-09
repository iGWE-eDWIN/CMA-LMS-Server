# Creative Minds Academy LMS - Mobile Application

A production-ready Learning Management System (LMS) mobile application built with React Native/Expo, Node.js/Express, and MongoDB.

## 🎯 Project Overview

Creative Minds Academy LMS is a comprehensive learning platform designed to deliver cutting-edge skills in technology, innovation, and entrepreneurship. The system supports three user roles (Students, Instructors, and Admins) with complex features including course management, live classes, payment processing, real-time messaging, and certificate generation.

### Company Context
- **Company:** Creative Minds Academy Ltd
- **Mission:** "Innovating Minds, Shaping Futures"
- **Focus:** Technology, Innovation, and Entrepreneurship Training
- **Current Base:** 300+ Students, 5 Staff Members, 230+ Completed Projects
- **Tagline:** "Empowering Your Success with Cutting-Edge Solutions"

---

## 🏗️ System Architecture

### Tech Stack

**Frontend:**
- React Native with Expo SDK
- Expo Router for navigation
- Context API for state management
- TypeScript for type safety
- Socket.IO Client for real-time features

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.IO for real-time messaging
- Multer for file uploads
- bcryptjs for password hashing
- Paystack, Flutterwave, Stripe integration

**Deployment:**
- Backend: AWS EC2 / Heroku / DigitalOcean
- Frontend: Expo EAS / Vercel
- Database: MongoDB Atlas
- Storage: AWS S3 / Cloudinary

---

## 👥 User Roles & Features

### 1. **Student Portal**
- User authentication (Register, Login, Email Verification, Password Reset)
- Profile management (Update info, Upload profile picture)
- Course discovery (Browse, Search, Filter courses)
- Course enrollment and payment processing
- Video lessons and resource downloads
- Assignment submission and grading
- Quiz/exam taking with results
- Live class participation via Google Meet
- Certificate earning and download
- Real-time notifications and messaging with instructors
- Wallet management (Fund, Check balance, Transaction history)

### 2. **Instructor Portal**
- Secure login and profile management
- Course content creation (Videos, PDFs, Assignments, Quizzes)
- Assignment grading and student feedback
- Student progress tracking
- Live class scheduling with Google Meet links
- Student messaging and announcements
- Earnings tracking and wallet management
- Withdrawal request management

### 3. **Admin Portal**
- **User Management:** Create, Read, Update, Delete students/instructors
- **Course Management:** CRUD operations, pricing, category assignment
- **Financial Management:** Credit/debit wallets, approve withdrawals, generate reports
- **Content Moderation:** Approve content, manage certificates
- **Live Classes:** Monitor schedules and sessions
- **Analytics Dashboard:** Real-time statistics on students, instructors, revenue, enrollments

---

## 📁 Project Structure

```
CMA/
├── backend/
│   ├── src/
│   │   ├── config/           # Database, JWT, environment configs
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helpers, validators, formatters
│   │   ├── socket/            # Socket.IO events
│   │   └── app.js             # Express app setup
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/            # Login, Register, Password Reset
│   │   ├── (student)/         # Student screens
│   │   ├── (instructor)/      # Instructor screens
│   │   ├── (admin)/           # Admin screens
│   │   └── _layout.tsx        # Root layout
│   ├── components/            # Reusable components
│   ├── context/               # Context API setup
│   ├── services/              # API calls, utilities
│   ├── types/                 # TypeScript types
│   ├── assets/                # Images, fonts, etc.
│   ├── app.json               # Expo config
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── ARCHITECTURE.md        # System architecture details
│   ├── DATABASE_SCHEMA.md     # MongoDB schemas
│   ├── API_DOCUMENTATION.md   # REST API endpoints
│   ├── AUTHENTICATION_FLOW.md # Auth flow details
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── IMPLEMENTATION_PLAN.md # Step-by-step plan
│
└── README.md
```

---

## 🚀 Key Features

### 1. **Authentication & Security**
- JWT-based authentication
- Email verification
- Password reset mechanism
- Role-Based Access Control (RBAC)
- Refresh token mechanism
- Password hashing with bcrypt
- API rate limiting
- Input validation and sanitization

### 2. **Course Management**
- Multiple course modules and lessons
- Video streaming support
- PDF and resource downloads
- Course categorization
- Course progress tracking
- Different access levels (free, premium)

### 3. **Payment System**
- Paystack integration
- Flutterwave integration
- Stripe integration (optional)
- Transaction history
- Payment verification
- Refund management
- Wallet system for students and instructors

### 4. **Live Classes**
- Google Meet integration
- Class scheduling
- Real-time class monitoring
- Class recording links
- Attendance tracking

### 5. **Assessment & Certification**
- Quizzes with auto-grading
- Manual assignment grading
- Certificate generation with QR codes
- Certificate verification
- Automated certificate issuance on completion

### 6. **Real-Time Communication**
- Socket.IO messaging
- Student-Instructor chat
- Admin-User messaging
- File sharing in messages
- Notification alerts
- Message status indicators

### 7. **Notifications**
- Push notifications (Expo)
- In-app notifications
- Email notifications
- Event-triggered notifications (enrollment, deadlines, payments, etc.)

### 8. **Admin Dashboard**
- User management interface
- Course analytics
- Financial analytics
- Revenue reports
- Enrollment statistics
- Active user tracking

---

## 📋 Deliverables

This project includes:

1. ✅ Complete system architecture documentation
2. ✅ MongoDB database schema design
3. ✅ Backend folder structure with models, controllers, routes
4. ✅ Frontend folder structure with screens and components
5. ✅ REST API documentation
6. ✅ Authentication and authorization flows
7. ✅ Wallet system implementation
8. ✅ Course enrollment workflow
9. ✅ Payment processing flow
10. ✅ Live class integration
11. ✅ Certificate generation system
12. ✅ Admin dashboard design
13. ✅ React Native Expo Router implementation
14. ✅ Node.js + Express.js backend code
15. ✅ Production deployment strategy
16. ✅ Scalability recommendations
17. ✅ Security best practices
18. ✅ Step-by-step implementation plan

---

## 🔗 Documentation

- **[System Architecture](./docs/ARCHITECTURE.md)** - Complete system design
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - MongoDB models and relationships
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - All REST endpoints with examples
- **[Authentication Flow](./docs/AUTHENTICATION_FLOW.md)** - Auth, token, and RBAC flows
- **[Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)** - Step-by-step development guide
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment and scaling

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB Atlas account
- Expo CLI
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configurations
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with backend URL
npm start
```

---

## 📞 Support & Contact

For creative minds academy:
- Website: https://www.creativemindacademyltd.com
- WhatsApp: +234 702 527 4056
- Instagram: @crea_tivemindsacademy
- LinkedIn: Creative Mind Academy GO

---

## 📄 License

This project is proprietary to Creative Minds Academy Ltd.

---

**Last Updated:** June 2026
**Version:** 1.0.0 - Initial Setup
