import React, { useState } from "react";
import "./LoginPage.css";

interface LoginPageProps {
  onLogin: (username: string) => void | Promise<void>;
  onSignUp: (username: string) => void | Promise<void>;
  error?: string | null;
  loading?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp, error, loading }) => {
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
      <header className="login-header">
        <img src="icons/logo.png" alt="GamePlan Logo" className="login-logo" />
        <h1 className="login-headline">GamePlan</h1>
      </header>
      <h2 className="login-title">Login</h2>
      {error && <div className="login-error">{error}</div>}
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={handleInputChange}
        className="login-input"
        autoFocus
        disabled={loading}
      />
      <div className="login-buttons">
        <button onClick={handleLogin} disabled={loading}>Login</button>
        <button onClick={handleSignUp} disabled={loading}>Sign Up</button>
      </div>
      {loading && <div className="login-loading">Loading...</div>}
    </div>
  );
};

export default LoginPage;
