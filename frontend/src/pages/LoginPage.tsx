import React from "react";
import { Box } from "@mui/material";
import LoginForm from "../components/LoginForm"; 
import "../styles/SnowBackground.css";

const Login = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#111827",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Snow background - four layers of stars with staggered animations */}
      {[1, 2, 3, 4,5,6].map((num) => (
        <div key={num} className={`box-of-star${num}`}>
          {[1, 2, 3, 4, 5, 6, 7].map((pos) => (
            <div key={pos} className={`star star-position${pos}`}></div>
          ))}
        </div>
      ))}

      {/* Foreground login form */}
      <Box
        sx={{
          position: "relative",
          zIndex: 20,
          width: "100%",
          maxWidth: 400,
          padding: 3,
          borderRadius: "0.75rem",
          backgroundColor: "rgba(17, 24, 39, 0.9)",
        }}
      >
        <LoginForm />
      </Box>
    </Box>
  );
};

export default Login;
