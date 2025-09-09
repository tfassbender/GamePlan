import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import PlanDetailsPage from "./PlanDetailsPage";
import { loginUser, signUpUser } from "./api";
import "./App.css";

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username: string }>();
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync state with URL
  useEffect(() => {
    if (routeUsername) setUsername(routeUsername);
    else setUsername(null);
  }, [routeUsername]);

  const handleLogin = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginUser(name);
      setUsername(name);
      navigate(`/${name}`);
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
      navigate(`/${name}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Sign up failed - user may already exist");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUsername(null);
    setError(null);
    navigate(`/`);
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

  return <DashboardPage username={username} onLogout={handleLogout} />;
};

const PlanDetailsWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { username, planName } = useParams<{ username: string; planName: string }>();
  if (!username || !planName) return null;
  return (
    <PlanDetailsPage
      username={username}
      planName={decodeURIComponent(planName)}
      onBack={() => navigate(`/${username}`)}
    />
  );
};

const App: React.FC = () => (
  <BrowserRouter basename="/app">
    <Routes>
      <Route path="/" element={<AppRoutes />} />
      <Route path=":username" element={<AppRoutes />} />
      <Route path="/:username" element={<AppRoutes />} />
      <Route path=":username/plan/:planName" element={<PlanDetailsWrapper />} />
      <Route path="/:username/plan/:planName" element={<PlanDetailsWrapper />} />
    </Routes>
  </BrowserRouter>
);

export default App;
