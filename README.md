# React Authentication App with Auto Token Refresh & Inactivity Logout

## Table of Contents

- [Project Overview](#project-overview)  
- [Project Structure](#project-structure)  
- [Key Features](#key-features)  
- [API Endpoints](#api-endpoints)  
- [Authentication Workflow](#authentication-workflow)  
- [Token Refresh & Inactivity Handling](#token-refresh--inactivity-handling)  
- [Frontend Route Protection](#frontend-route-protection)  
- [Setup Instructions](#setup-instructions)  
- [Running the Application](#running-the-application)  
- [Best Practices](#best-practices)  
- [Troubleshooting](#troubleshooting)  
- [Contributing](#contributing)  

---

## Project Overview

This project is a **secure, modern full-stack web application** built with **React** on the frontend and **Node.js/Express** on the backend. It demonstrates a robust, production-grade authentication system using **JWT (JSON Web Tokens)** with advanced features to ensure security and usability:

- Short-lived access tokens combined with long-lived, rotated refresh tokens.
- Automatic silent token refreshes on the frontend.
- Refresh token rotation to prevent replay attacks.
- Automatic logout after user inactivity.
- Protected frontend routes that only authenticated users can access.
- Manual logout with full session teardown.
- Synchronization of Redux state and browser localStorage for persistency.

---

## Project Structure
```
/
├─ backend/ # Node.js/Express backend API server
│ ├─ src/
│ │ ├─ app/ # Express server setup and middleware
│ │ ├─ user/ # User module: controllers, services, models
│ │ ├─ common/ # Utilities and shared middleware (e.g. auth middleware)
│ │ ├─ routes.ts # Router declarations
│ │ ├─ index.ts # Server entrypoint
│ │ ├─ swagger.json # OpenAPI documentation
│ │ └─ .env.local # Environment variables (gitignored)
│ ├─ package.json
│ ├─ tsconfig.json
│ └─ .gitignore
├─ frontend/ # React frontend application
│ ├─ public/ # Static assets (favicon, index.html)
│ ├─ src/
│ │ ├─ components/ # UI components (LoginForm, Header, etc.)
│ │ ├─ hooks/ # Custom hooks (useAutoRefreshToken, useInactivityTimer)
│ │ ├─ layouts/ # Layout components (Authenticated, Basic)
│ │ ├─ pages/ # Pages (Login, Register, Dashboard)
│ │ ├─ reducers/ # Redux slices (authReducers)
│ │ ├─ services/ # API interaction via RTK Query or axios
│ │ ├─ store/ # Redux store configuration
│ │ ├─ styles/ # CSS stylesheets
│ │ ├─ App.tsx # Root React component and routing
│ │ ├─ index.tsx # React app entrypoint
│ │ ├─ main.tsx # Vite bootstrap
│ │ └─ vite-env.d.ts # Vite Typescript types
│ ├─ package.json
│ ├─ tsconfig.app.json
│ ├─ vite.config.ts
│ ├─ eslint.config.js
│ ├─ index.html
│ └─ .gitignore
├─ README.md # This file
└─ .gitignore
```  
---

## Key Features

### 1. Secure JWT Authentication with Access and Refresh Tokens

- **Access Token:** Short-lived (e.g., 15 minutes) JWT used to authenticate API requests.
- **Refresh Token:** Longer-lived token used only to obtain new access tokens.
- Tokens are stored securely in Redux state and persisted to browser `localStorage`.
- Refresh token rotation is implemented to issue a new refresh token on each usage, invalidating the old refresh token to prevent replay attacks.

### 2. Automatic Token Refresh

- The React frontend uses a custom hook (`useAutoRefreshToken`) which monitors access token expiry and transparently fetches a new access token using the refresh token.
- This keeps the user logged in smoothly without manual re-login.

### 3. Refresh Token Rotation and Security

- On every refresh token use, the backend issues a new refresh token and access token.
- The old refresh token is invalidated to prevent reuse and replay attacks.

### 4. Inactivity Logout

- A custom hook (`useInactivityTimer`) tracks user interactions (mouse movements, key presses).
- Logs out the user automatically upon 15 minutes of inactivity to improve security.

### 5. Protected Frontend Routes

- React Router combined with route guards (`Authenticated` layout component) protect private routes.
- Only authenticated sessions with a valid access token can access pages like Dashboard or Profile.
- Users are redirected to login if not authenticated.

### 6. Manual Logout

- Users can manually log out from anywhere via a clear logout button.
- Tokens are cleared from Redux and localStorage.
- Backend endpoint is called to invalidate the refresh token on server.

---

## API Endpoints

| Endpoint                 | Method | Description                                   | Request Body                          | Response                              |
|--------------------------|--------|-----------------------------------------------|-------------------------------------|-------------------------------------|
| `/api/users/register`     | POST   | Register user                                | `{ username, email, password }`      | `{ user, tokens: accessToken, refreshToken }` |
| `/api/users/login`        | POST   | User login                                   | `{ email, password }`                 | `{ user, tokens: accessToken, refreshToken }` |
| `/api/auth/refresh`       | POST   | Refresh access token                          | `{ userId, refreshToken }`            | `{ accessToken, refreshToken }`     |
| `/api/auth/logout`        | POST   | Log out and revoke refresh token             | `{ userId, refreshToken }`            | `{ message: "Logged out" }`          |

---

## Authentication Workflow

### Login

- The frontend login form collects credentials and sends to `/api/users/login`.
- Backend validates credentials, creates short-lived access and refresh tokens.
- Refresh token is stored hashed in DB, access token contains user info claims.
- Frontend saves tokens in Redux and localStorage, marks user authenticated.

### Access Token Usage

- Access token is sent with API requests in `Authorization: Bearer <access_token>` header.
- Backend middleware verifies the access token before granting access.

### Token Refresh Flow

- When access token is about to expire, frontend calls `/api/auth/refresh` with current refresh token.
- Backend validates the refresh token, issues new access and refresh tokens.
- Old refresh token is revoked (rotation).
- Frontend updates stored tokens seamlessly.

### Logout & Inactivity

- User-triggered logout calls `/api/auth/logout` to revoke refresh token.
- Inactivity logout triggers the same flow automatically after timeout.

---

## Token Refresh & Inactivity Handling

- Tokens refreshed every ~14 minutes before access token expiry.
- `useAutoRefreshToken` React hook sets interval timers and triggers refreshes.
- `useInactivityTimer` resets on user interaction, logs out after 15 minutes idle.
- This combination ensures session security without interrupting user workflow.

---

## Frontend Route Protection

- Routes wrapped with `<Authenticated>` layout component.
- Checks authentication state in Redux.
- Redirects unauthenticated access attempts to login page.

---

## Setup Instructions

1. **Clone the repository**

```
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2. **Backend Setup**

```
cd backend
npm install

Create .env.local with environment variables such as DB connection string, JWT secrets
npm run dev

```

3. **Frontend Setup**

```
cd ../frontend
npm install

Create environment variables if required (e.g., API base URL)
npm run dev
```

4. **Access the application**

Visit `http://localhost:3000` (or configured port) in your browser.

---

## Running the Application

- Register a new user or login.
- Access protected Dashboard or Profile pages.
- Observe automatic token refreshing in network requests.
- Try inactivity logout by leaving the app idle for 15 minutes.
- Manual logout works as expected.

---

## Best Practices

- Keep access tokens short-lived (15 minutes) for limiting exposure.
- Use refresh token rotation to prevent replay attacks.
- Store tokens securely in memory and localStorage carefully.
- Implement frontend route guards.
- Clear tokens on logout and inactivity.
- Use HTTPS in production for secure token transmission.

---

## Troubleshooting

- If you face Git conflicts or push errors, resolve conflicts carefully before pushing.
- Ensure environment variables (JWT secrets, DB creds) are set properly.
- Check network logs for token refresh calls.
- Monitor backend for errors in token verification or database issues.

---

## Contributing

Contributions are welcome! Please:

- Fork the repository.
- Create feature branches.
- Write clear commit messages.
- Submit pull requests for review.

---

*Happy coding!*

