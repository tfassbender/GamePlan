import React, { useState } from "react";
import "./LoginPage.css";

interface LoginPageProps {
  onLogin: (username: string) => void;
  onSignUp: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
  const [username, setUsername] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleLogin = () => {
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  const handleSignUp = () => {
    if (username.trim()) {
      onSignUp(username.trim());
    }
  };

  return (
    <div className="login-container">
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
        <img src="icons/logo.png" alt="GamePlan Logo" style={{ width: 64, height: 64, marginBottom: 8 }} />
        <h1 style={{ margin: 0, fontSize: "2.2rem", color: "#f1f1f1", letterSpacing: 1 }}>GamePlan</h1>
      </header>
      <h2 className="login-title">Login</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={handleInputChange}
        className="login-input"
        autoFocus
      />
      <div className="login-buttons">
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleSignUp}>Sign Up</button>
      </div>
    </div>
  );
};

export default LoginPage;
