import { Route, Routes, Navigate } from "react-router-dom";
import AuthenticatedLayout from "./layouts/Authenticated";
import BasicLayout from "./layouts/Basic";

import Home from "./pages/DashboardPage";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import ProfilePage from "./pages/ profile"; // fixed import path

function App() {
  return (
    <Routes>
  
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Add more authenticated routes here */}
      </Route>

      {/* Public routes */}
      <Route element={<BasicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
