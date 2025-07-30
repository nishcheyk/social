import React, { useCallback } from "react";
import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoutMutation } from "../services/api";
import { useAppSelector, useAppDispatch } from "../store/store";
import { setAccessToken, setAuthenticated } from "../reducers/authReducers";
import { useInactivityTimer } from "../hooks/useInactivityTimer";
import { useAutoRefreshToken } from "../hooks/useAutoRefreshToken";

export default function AuthenticatedLayout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logoutUser, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') ?? '';
  const accessToken = localStorage.getItem('accessToken') ?? '';
  

  
  const handleLogout = useCallback(async () => {
    try {
      await logoutUser({ userId, accessToken }).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(setAccessToken(undefined));
      dispatch(setAuthenticated(false));

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("sessionId");

      navigate("/login", { replace: true });
    }
  }, [dispatch, logoutUser, navigate]);

  const handleLogoutOnInactive = useCallback(() => {
    toast.dismiss(); // remove all toasts
    handleLogout();
  }, [handleLogout]);

  // Toast IDs for warnings so we can control lifetime or dismiss manually
  const warning1ToastId = "warning1-toast";
  const warning2ToastId = "warning2-toast";
  const countdownToastId = "countdown-toast";

  // Show warning 1 toast (stays ~15 sec)
  const handleWarning1 = useCallback(() => {
    toast.warn(
      "You have been inactive for 10 minutes. Please interact to stay logged in.",
      {
        toastId: warning1ToastId,
        autoClose: 15000, // 15 seconds
        closeButton: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }, []);

  // Show warning 2 toast (last 5 minutes, stays until cleared)
  const handleWarning2 = useCallback(() => {
    if (!toast.isActive(warning2ToastId)) {
      toast.warn("5 minutes remaining before automatic logout due to inactivity.", {
        toastId: warning2ToastId,
        autoClose: false, // stay until dismissed
        closeButton: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  const handleFinalCountdownTick = useCallback((secondsRemaining: number) => {
    toast.update(countdownToastId, {
      render: `Logging out in ${secondsRemaining} second${secondsRemaining !== 1 ? "s" : ""} due to inactivity.`,
      autoClose: false,
      closeButton: false,
      pauseOnHover: false,
      draggable: false,
      // to keep toast visible during countdown
    });
    if (!toast.isActive(countdownToastId)) {
      toast.info(`Logging out in ${secondsRemaining} seconds due to inactivity.`, {
        toastId: countdownToastId,
        autoClose: false,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
      });
    }
  }, []);

  // Reset and clear toasts on any user activity
  const handleReset = useCallback(() => {
    toast.dismiss([warning1ToastId, warning2ToastId, countdownToastId]);
  }, []);

  const inactivityTimer = useInactivityTimer({
    onWarning1: handleWarning1,
    onWarning2: handleWarning2,
    onFinalCountdownTick: handleFinalCountdownTick,
    onInactive: handleLogoutOnInactive,
    onReset: handleReset,
  });

  useAutoRefreshToken(isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          width: "100vw",
          boxSizing: "border-box",
          backgroundColor: "#fff",
        }}
      >
        <h1 style={{ marginRight: "auto" }}>
          <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
            App Logo
          </Link>
        </h1>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#004990",
            color: "#fff",
            borderRadius: 6,
            border: "none",
            fontWeight: "bold",
          }}
          aria-label="Logout"
          title="Logout"
        >
          Logout ⏻
        </button>
      </header>

      {/* Toast container for notifications */}
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        autoClose={5000}
      />

      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}
