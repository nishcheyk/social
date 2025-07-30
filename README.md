React Authentication App with Auto Token Refresh & Inactivity Logout
Table of Contents
Project Overview

Project Structure

Key Features

Frontend Workflow

Backend Workflow

Token Refresh & Inactivity Handling

Routing & Security

Setup Instructions

Running the Application

Best Practices

Troubleshooting

Contributing

Project Overview
This project is a secure and modern web application built with React for the frontend and Node.js/Express for the backend. It demonstrates a production-grade authentication system including:

JWT access and refresh tokens with rotation.

Automatic token refreshing before expiry.

Automatic logout on user inactivity.

Protected routes accessible only to authenticated users.

Manual logout with full cleanup.

The system is designed to keep users authenticated seamlessly while ensuring security by logging out inactive users and removing expired or invalid tokens.

Project Structure
text
/ (root)
├─ frontend/
│ ├─ src/
│ │ ├─ components/ # UI components (e.g., AuthenticatedLayout)
│ │ ├─ hooks/ # Custom hooks (useAutoRefreshToken, useInactivityTimer)
│ │ ├─ reducers/ # Redux slice files for auth state
│ │ ├─ services/ # RTK Query API slice with refresh-baseQuery
│ │ ├─ store/ # Redux store configuration
│ │ └─ pages/ # Pages such as Login, Dashboard, Profile
├─ backend/
│ ├─ src/
│ │ ├─ controllers/ # Backend request handlers
│ │ ├─ middleware/ # Authentication middleware
│ │ ├─ models/ # Database models
│ │ └─ routes/ # Express route definitions
├─ README.md # Project documentation
└─ .gitignore
Key Features
Secure JWT Authentication: Access tokens expire frequently, refreshed automatically using refresh tokens.

Refresh Token Rotation: Refresh tokens are single-use and replaced on every refresh to improve security.

Automatic Token Refresh: The frontend calls the refresh API regularly (e.g., every 14 minutes) while user is active.

Inactivity Logout: Automatically logs out users after 15 minutes of inactivity.

Protected Routes: Uses React Router and Redux state to guard protected pages from unauthenticated access.

Manual Logout: Logout button clears tokens, Redux state and notifies the backend.

Optimized Frontend Architecture: React hooks, Redux Toolkit, and RTK Query for state and API handling.

Consistent Session Management: Synchronization between Redux state and browser storage.

Frontend Workflow
Login: User submits credentials via login form; backend returns access & refresh tokens.

Token Storage: Tokens are saved in both Redux store and localStorage.

Authenticated UI: Protected routes are wrapped in AuthenticatedLayout component that:

Guards unauthorized access.

Provides logout button.

Automatic Token Refresh:

Hook useAutoRefreshToken periodically calls refresh API using the current refresh token.

On success, updates tokens both in Redux and localStorage.

Inactivity Monitoring:

Hook useInactivityTimer listens for user events.

Logs out user if no activity for 15 minutes.

Logout: Clears tokens and Redux, navigates to login.

Backend Workflow
Login Endpoint: Validates credentials and issues access & refresh tokens.

Refresh Endpoint:

Validates refresh token.

Issues new access and refresh tokens (rotation).

Invalidates old refresh token.

Logout Endpoint: Revokes tokens and terminates session.

Protected Endpoints: Require valid access tokens; reject expired/invalid tokens.

Token Expiration:

Access token lifespan short (e.g., 15 minutes).

Refresh token lifespan longer but rotated on use.

Token Refresh & Inactivity Handling
Token Refresh: Frontend proactively refreshes tokens using a timer slightly shorter than the token lifetime.

Refresh Failures: On failure (expired refresh token), frontend clears auth state and forces logout.

Inactivity Logout: Frontend tracks user activity; absence for configured period triggers logout and token cleanup.

Routing & Security
Public routes (Login/Register) accessible by all.

Private routes only accessible when authenticated.

AuthenticatedLayout manages routing and session control.

Setup Instructions
Prerequisites
Node.js v16+

npm or yarn

MongoDB or configured backend database

Backend
bash
cd backend
npm install

# create .env with JWT secrets and DB URI

npm run start
Frontend
bash
cd frontend
npm install

# optionally update API base URL if backend runs elsewhere

npm run dev
Running the Application
Start backend on port 3000 (or configured port).

Start frontend Vite dev server (default port 5173 or configured differently).

Access frontend at http://localhost:5173/ (or your port).

Register, login, and test auto-refresh, inactivity logout, and protected routing.

Best Practices
Keep backend and frontend token lifetimes synced.

Secure token storage to prevent XSS vulnerabilities.

Use HTTPS and secure cookies in production.

Show users feedback on auto-logout.

Test hooks and endpoints thoroughly.

Troubleshooting
Ensure useAutoRefreshToken is invoked on authenticated page layouts.

Verify tokens are saved and read correctly from localStorage.

Check backend token expiration policy matches frontend logic.

Confirm proxy or CORS setup between frontend and backend as needed.

Fix build errors by configuring TypeScript support if using .tsx files.

Contributing
Fork the repo.

Create feature or bugfix branches.

Write clean, documented code.

Submit pull requests with descriptions.

Feel free to ask if you want me to help generate README for specific folders or files or add scripts and deployment steps!
