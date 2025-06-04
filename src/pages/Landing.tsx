import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";
import Header from "../pages/Header";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="auth-container">
        <div className="auth-box">
          <h2>Welcome to BlockTask</h2>
          <p>Earn coins by completing your tasks🤑</p>
          <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-btn" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </div>
    </>
  );
};

export default Landing;
