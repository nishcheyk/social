import React, { useState, useCallback } from "react";
import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
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

  const [isHovered, setIsHovered] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);

  // Manual logout handler (via button)
  const handleLogout = useCallback(async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(setAccessToken(undefined));
      dispatch(setAuthenticated(false));

      // Clear all relevant tokens and user data in localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("sessionId");

      navigate("/login", { replace: true });
    }
  }, [dispatch, logoutUser, navigate]);

  // Automatic logout on user inactivity (e.g., 15 minutes)
  const handleLogoutOnInactive = useCallback(() => {
    dispatch(setAccessToken(undefined));
    dispatch(setAuthenticated(false));

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("sessionId");

    navigate("/login", { replace: true });
  }, [dispatch, navigate]);


  useInactivityTimer(handleLogoutOnInactive);


  useAutoRefreshToken(isAuthenticated);

  // Redirect unauthorized users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Styling
  const headerStyle: React.CSSProperties = {
    padding: "1rem 2rem",
    borderBottom: "1px solid #ccc",
    display: "flex",
    alignItems: "center",
    width: "100vw",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  };

  const logoStyle: React.CSSProperties = {
    marginRight: "1rem",
    whiteSpace: "nowrap",
    fontWeight: "bold",
    fontSize: "1.25rem",
  };

  const navContainerStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    backgroundColor: "rgba(0, 73, 144)",
    width: isHovered ? 300 : 250,
    height: 40,
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 10,
    boxShadow:
      "rgba(0, 0, 0, 0.35) 0px 5px 15px, rgba(0, 73, 144, 0.5) 5px 10px 15px",
    transition: "width 0.5s",
    cursor: "pointer",
    userSelect: "none",
  };

  const buttonStyle: React.CSSProperties = {
    outline: "none",
    border: "none",
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    transition: "transform 0.3s ease-in-out",
    cursor: "pointer",
    fontSize: 20,
  };

  const buttonTransform = buttonHover ? "translateY(-3px)" : undefined;

  return (
    <>
      <header style={headerStyle}>
        <h1 style={logoStyle}>
          <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
            App Logo
          </Link>
        </h1>

        <nav style={navContainerStyle}>
          <div
            style={buttonContainerStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              style={{ ...buttonStyle, transform: buttonTransform, opacity: isLoading ? 0.6 : 1 }}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              aria-label="Logout"
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}
