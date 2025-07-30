import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLoginMutation } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/store"; // Import Redux dispatcher typed hook
import { setAccessToken, setAuthenticated } from "../reducers/authReducers"; // import your auth slice actions
import "../styles/AuthForm.css";
import {
  Google,
  LinkedIn,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

// Validation schema for form fields using Yup
const validationSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 chars are required")
    .max(16, "Maximum 16 chars allowed"),
});

type FormData = yup.InferType<typeof validationSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // RTK Query mutation hook for login
  const [loginUser, { isLoading }] = useLoginMutation();

  // React Hook Form setup with validation schema and default values
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  // Toggles password visibility
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Submit handler for form
  const onSubmit = async (data: FormData) => {
    try {
      const result = await loginUser(data).unwrap();

      console.log("Login API result:", result);

      // Since your backend returns tokens directly, check for tokens directly
      if (result.accessToken && result.refreshToken && result.userId) {
        // Save tokens and user info in localStorage
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("userId", result.userId);

        // Optionally save sessionId if exists
        if ((result as any).sessionId) {
          localStorage.setItem("sessionId", (result as any).sessionId);
        }

        // Update global Redux auth state - very important for route protection and navigation
        dispatch(setAccessToken(result.accessToken));
        dispatch(setAuthenticated(true));

        toast.success("User logged in successfully!");

        // Navigate to dashboard once, with replace: true to prevent going back to login
        navigate("/dashboard", { replace: true });

        console.log("Navigated to dashboard");
      } else if ("message" in result) {
        toast.error(result.message);
      } else {
        toast.error("Login failed. Invalid response from server.");
      }
    } catch (error: any) {
      console.error("Login error", error);

      if (error?.status === 429) {
        toast.error("Too many login attempts. Please try again after 5 minutes.");
        return;
      }

      // Try extracting validation or general error msgs from various error shapes
      const validationError =
        error?.data?.data?.errors?.[0]?.msg ||
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Login failed. Please check your credentials.";

      toast.error(validationError);
    }
  };

  return (
    <div className="form-container">
      <p className="title">Login</p>
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Username Field */}
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            {...register("username")}
            aria-invalid={!!errors.username}
            autoComplete="username"
            placeholder="Enter your username"
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && (
            <small role="alert" className="error-text">
              {errors.username.message}
            </small>
          )}
        </div>

        {/* Password Field */}
        <div className="input-group" style={{ position: "relative" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={errors.password ? "input-error" : ""}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 10,
              top: 38,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "#999",
            }}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </button>

          <div className="forgot">
            <a href="/forgot-password" rel="noopener noreferrer">
              Forgot Password?
            </a>
          </div>
          {errors.password && (
            <small role="alert" className="error-text">
              {errors.password.message}
            </small>
          )}
        </div>

        {/* Submit Button */}
        <button className="sign" type="submit" disabled={!isValid || isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Social Login Section */}
      <div className="social-message">
        <div className="line"></div>
        <p className="message">Login with social accounts</p>
        <div className="line"></div>
      </div>

      <div className="social-icons">
        <button aria-label="Log in with Google" className="icon" type="button">
          <Google sx={{ height: 30, width: 30, fill: "#4c89ed" }} />
        </button>
        <button aria-label="Log in with LinkedIn" className="icon" type="button">
          <LinkedIn sx={{ height: 30, width: 30, fill: "#0a66c2" }} />
        </button>
        <button aria-label="Log in with GitHub" className="icon" type="button">
          {/* Add GitHub SVG or icon */}
        </button>
      </div>

      <p className="signup">
        Don't have an account?{" "}
        <a href="/signup" rel="noopener noreferrer" className="">
          Sign up
        </a>
      </p>
    </div>
  );
}
