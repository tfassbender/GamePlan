import React, { useState } from "react";
import LoginPage from "./LoginPage";
import "./App.css";

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);

  const handleLogin = (name: string) => {
    setUsername(name);
    // TODO: Add login logic (API call, etc.)
  };

  const handleSignUp = (name: string) => {
    setUsername(name);
    // TODO: Add sign up logic (API call, etc.)
  };

  if (!username) {
    return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return <h1>Hello, {username}! Welcome to GamePlan.</h1>;
};

export default App;
