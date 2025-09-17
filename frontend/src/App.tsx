import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import PlanDetailsPage from "./PlanDetailsPage";
import { loginUser, signUpUser } from "./common/api";
import "./App.css";
import ConfirmDialog, { ConfirmDialogType } from "./ConfirmDialog";

// Context for showing confirm dialog
interface ConfirmDialogContextType {
  showConfirmDialog: (options: {
    title?: string;
    message: string;
    onConfirm: () => void;
    type?: ConfirmDialogType;
  }) => void;
}
const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const useConfirmDialog = () => {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  return ctx;
};

const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});
  const [type, setType] = useState<ConfirmDialogType>(ConfirmDialogType.DEFAULT);

  const showConfirmDialog = ({ title, message, onConfirm, type }: { title?: string; message: string; onConfirm: () => void; type?: ConfirmDialogType; }) => {
    setTitle(title);
    setMessage(message);
    setOnConfirm(() => () => {
      setOpen(false);
      onConfirm();
    });
    setType(type || ConfirmDialogType.DEFAULT);
    setOpen(true);
  };

  const handleCancel = () => setOpen(false);

  return (
    <ConfirmDialogContext.Provider value={{ showConfirmDialog }}>
      {children}
      <ConfirmDialog open={open} title={title} message={message} onConfirm={onConfirm} onCancel={handleCancel} type={type} />
    </ConfirmDialogContext.Provider>
  );
};

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
  <ConfirmDialogProvider>
    <BrowserRouter basename="/app">
      <Routes>
        <Route path="/" element={<AppRoutes />} />
        <Route path=":username" element={<AppRoutes />} />
        <Route path="/:username" element={<AppRoutes />} />
        <Route path=":username/plan/:planName" element={<PlanDetailsWrapper />} />
        <Route path="/:username/plan/:planName" element={<PlanDetailsWrapper />} />
      </Routes>
    </BrowserRouter>
  </ConfirmDialogProvider>
);

export default App;
