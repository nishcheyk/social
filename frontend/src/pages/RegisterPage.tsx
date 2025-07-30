import { Box } from "@mui/material";
import "../styles/SnowBackground.css";
import { SignupForm } from "../components/SignupForm";

const Register = () => {
  return (
    <Box
      sx={{
        position: "relative", 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#111827", 
      }}
    >

      <div className="box-of-star1">
        <div className="star star-position1"></div>
        <div className="star star-position2"></div>
        <div className="star star-position3"></div>
        <div className="star star-position4"></div>
        <div className="star star-position5"></div>
        <div className="star star-position6"></div>
        <div className="star star-position7"></div>
      </div>

      <div className="box-of-star2">
        <div className="star star-position1"></div>
        <div className="star star-position2"></div>
        <div className="star star-position3"></div>
        <div className="star star-position4"></div>
        <div className="star star-position5"></div>
        <div className="star star-position6"></div>
        <div className="star star-position7"></div>
      </div>

      <div className="box-of-star3">
        <div className="star star-position1"></div>
        <div className="star star-position2"></div>
        <div className="star star-position3"></div>
        <div className="star star-position4"></div>
        <div className="star star-position5"></div>
        <div className="star star-position6"></div>
        <div className="star star-position7"></div>
      </div>

      <div className="box-of-star4">
        <div className="star star-position1"></div>
        <div className="star star-position2"></div>
        <div className="star star-position3"></div>
        <div className="star star-position4"></div>
        <div className="star star-position5"></div>
        <div className="star star-position6"></div>
        <div className="star star-position7"></div>
      </div>

        
      <div className="page-container">
      <Box
        sx={{
          position: "relative",
          zIndex: 20, 
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <SignupForm />
      </Box>
      </div>
    </Box>
  );
};

export default Register;
