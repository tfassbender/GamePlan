import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import { getVersion } from "./common/api";
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

interface LoginPageProps {
  onLogin: (username: string) => void | Promise<void>;
  onSignUp: (username: string) => void | Promise<void>;
  error?: string | null;
  loading?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp, error, loading }) => {
  const [username, setUsername] = useState("");
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion(""));
  }, []);

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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
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
        onKeyDown={handleInputKeyDown}
        className="login-input"
        autoFocus
        disabled={loading}
      />
      <div className="login-buttons">
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          <span className="login-menu-icon"><FaSignInAlt /></span> Login
        </button>
        <button className="login-btn login-btn-signup" onClick={handleSignUp} disabled={loading}>
          <span className="login-menu-icon"><FaUserPlus /></span> Sign Up
        </button>
      </div>
      {loading && <div className="login-loading">Loading...</div>}
      <div className="login-version-info">{version && `Version: ${version}`}</div>
    </div>
  );
};

export default LoginPage;
