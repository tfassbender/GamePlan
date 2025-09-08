import React, { useState } from "react";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import { loginUser, signUpUser } from "./api";
import "./App.css";

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginUser(name);
      setUsername(name);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Login failed - user may not exist");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await signUpUser(name);
      setUsername(name);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Sign up failed - user may already exist");
    } finally {
      setLoading(false);
    }
  };

  if (!username) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        error={error}
        loading={loading}
      />
    );
  }

  const handleLogout = () => {
    setUsername(null);
    setError(null);
  };

  return <DashboardPage username={username} onLogout={handleLogout} />;
};

export default App;
