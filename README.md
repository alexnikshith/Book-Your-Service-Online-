# ServiceFinder - Local Service Discovery Application

A premium, full-stack MERN application for finding and booking local professional services.

## Features

- **Multi-Role Support**: Specialized dashboards for Customers, Service Providers, and Administrators.
- **Service Discovery**: Search and filter providers by category and location.
- **Booking System**: Securely book services with date and time slot selection.
- **Partner Management**: Providers can manage their job requests and update status (Pending -> Accepted -> Completed).
- **Admin Control**: Oversight of platform stats and provider verification queue.
- **Premium UI**: Modern glassmorphism design with fluid animations and responsive layout.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Security**: JWT Authentication, bcrypt password hashing.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

### 1. Database Configuration
1. Open `server/.env`.
2. Update `MONGO_URI` with your connection string.
3. (Optional) Provide a `GOOGLE_MAPS_API_KEY` for future map features.

### 2. Install Dependencies
```bash
# Install root (if any) or just go to subfolders
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Run the Application
You will need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm start
# or if you have nodemon: npx nodemon index.js
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

## Mock Data / Seed
To test, register as a 'Provider' first. Use the 'Admin' dashboard to approve your provider account so it appears in the discovery pages.

Enjoy building your local service empire!
