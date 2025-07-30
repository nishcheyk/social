import React from "react";
import { useGetProfileQuery } from "../services/api";
import { useAppSelector } from "../store/store";
import { Navigate } from "react-router-dom";
import "../styles/profilecard.css";

export default function ProfilePage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data, error, isLoading, isSuccess } = useGetProfileQuery();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    let message = "Error loading profile. Please try again later.";
    if ("status" in error) {

      message = `Error ${error.status}: ${error.data?.message || message}`;
    }
    return <p>{message}</p>;
  }
  

  if (!isSuccess || !data?.data) {
    return <p>User data not found.</p>;
  }

  const user = data.data;
 

  return (
    <div
  style={{
    maxWidth: 900,
    margin: "2rem auto",
    padding: "3rem",
    fontFamily: "Arial, sans-serif",

    width: "100vw",
    height: "calc(100vh - 4rem)",
    boxSizing: "border-box",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
      <div className="card">
        <p className="heading">User Info</p>
        <p>
        <strong>ID:</strong> {user._id ?? user.userId ?? "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>
    </div>
  );
}
