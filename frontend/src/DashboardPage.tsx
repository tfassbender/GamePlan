import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGames, getPlans, createPlan } from "./api";
import "./DashboardPage.css";

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
  const navigate = useNavigate();

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

  const handleCreatePlan = async () => {
    if (!selectedGame) return;
    setLoading(true);
    setError(null);
    try {
      await createPlan(username, selectedGame);
      const updatedPlans = await getPlans(username);
      setPlans(updatedPlans);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <span>Logged in as <b>{username}</b></span>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
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
                New Plan
              </button>
            </div>
          </div>
          <div className="dashboard-section">
            <h2>Your Plans</h2>
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
    </div>
  );
};

export default DashboardPage;
