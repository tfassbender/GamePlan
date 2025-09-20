import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGames, getPlans, createPlan, deletePlan, getVersion } from "./common/api";
import { useConfirmDialog } from "./App";
import { ConfirmDialogType } from "./ConfirmDialog";
import "./DashboardPage.css";
import { FaSignOutAlt, FaPlus, FaTrash } from 'react-icons/fa';

interface DashboardPageProps {
  username: string;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ username, onLogout }) => {
  const [games, setGames] = useState<string[]>([]);
  const [plans, setPlans] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<string>("");
  const navigate = useNavigate();
  const { showConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getGames(),
      getPlans(username)
    ])
      .then(([gamesList, plansList]) => {
        setGames(gamesList);
        setPlans(plansList);
        setSelectedGame(gamesList[0] || "");
      })
      .catch(e => setError(e?.response?.data?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion(""));
  }, [username]);

  const handleCreatePlan = async () => {
    if (!selectedGame) return;
    setLoading(true);
    setError(null);
    try {
      const newPlan = await createPlan(username, selectedGame);
      const planName = newPlan.name || newPlan.planName || newPlan.id || (typeof newPlan === 'string' ? newPlan : undefined);
      if (planName) {
        if ((window as any).appNavigate) {
          (window as any).appNavigate(`/app/${username}/plan/${encodeURIComponent(planName)}`);
        } else {
          window.location.href = `/app/${username}/plan/${encodeURIComponent(planName)}`;
        }
      } else {
        // fallback: just refresh plans list
        const updatedPlans = await getPlans(username);
        setPlans(updatedPlans);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = () => {
    showConfirmDialog({
      title: "Delete All Plans",
      message: "Are you sure you want to delete ALL your plans? This action cannot be undone!",
      type: ConfirmDialogType.DANGER,
      onConfirm: async () => {
        setLoading(true);
        setError(null);
        try {
          for (const planName of plans) {
            await deletePlan(username, planName);
          }
          setPlans([]);
        } catch (e: any) {
          setError(e?.response?.data?.message || "Failed to delete all plans");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-brand-header">
        <img src="/app/icons/logo.png" alt="GamePlan Logo" className="dashboard-logo" />
        <span className="dashboard-headline">GamePlan</span>
      </div>
      <div className="dashboard-header">
        <span className="dashboard-username">Logged in as: <b>{username}</b></span>
        <button className="logout-btn" onClick={onLogout}>
          <span className="dashboard-menu-icon"><FaSignOutAlt /></span> Logout
        </button>
      </div>
      {error && <div className="dashboard-error">{error}</div>}
      {loading ? (
        <div className="dashboard-loading">Loading...</div>
      ) : (
        <>
          <div className="dashboard-section">
            <h2>Available Games</h2>
            <div className="dashboard-game-types">
              <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)}>
                {games.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
              <button className="create-plan-btn" onClick={handleCreatePlan} disabled={!selectedGame || loading}>
                <span className="dashboard-menu-icon"><FaPlus /></span> New Plan
              </button>
            </div>
          </div>
          <div className="dashboard-section">
            <div className="dashboard-plans-header">
              <h2 style={{ margin: 0 }}>Your Plans</h2>
              <button className="delete-all-btn" onClick={handleDeleteAll} disabled={plans.length === 0 || loading}>
                <span className="dashboard-menu-icon"><FaTrash /></span> Delete All
              </button>
            </div>
            {plans.length === 0 ? (
              <div>No plans yet.</div>
            ) : (
              <div className="dashboard-plans-list">
                <ul>
                  {plans.map(plan => (
                    <li
                      key={plan}
                      className="dashboard-plan-item"
                      onClick={() => navigate(`/${username}/plan/${encodeURIComponent(plan)}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {plan}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
      <div className="dashboard-version-info">{version && `Version: ${version}`}</div>
    </div>
  );
};

export default DashboardPage;