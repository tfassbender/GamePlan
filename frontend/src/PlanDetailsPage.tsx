import React, { useState, useEffect } from "react";
import "./PlanDetailsPage.css";
import { fetchPlan, updatePlan } from "./api";
import type { PlanDto } from "./types";

interface PlanDetailsPageProps {
  username: string;
  planName: string;
  onBack: () => void;
}

const PlanDetailsPage: React.FC<PlanDetailsPageProps> = ({ username, planName, onBack }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesNonNegative, setResourcesNonNegative] = useState(true); // will be computed from plan steps in the future
  const [plan, setPlan] = useState<PlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPlan(username, planName)
      .then(data => {
        setPlan(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username, planName]);

  // Debounced update effect
  useEffect(() => {
    if (!plan) return;
    // Don't send update on initial load
    if (loading) return;
    const handler = setTimeout(() => {
      updatePlan(username, plan)
        .catch(err => {
          // Optionally handle error (e.g., show a message)
        });
    }, 300);
    return () => clearTimeout(handler);
  }, [plan?.description]);

  const handleAddStage = () => {
    // TODO: Implement add stage logic
    setMenuOpen(false);
    alert("Add stage (not implemented)");
  };

  const handleClone = () => {
    // TODO: Implement clone logic
    setMenuOpen(false);
    alert("Clone plan (not implemented)");
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    setMenuOpen(false);
    alert("Delete plan (not implemented)");
  };

  return (
    <div className="plan-details-container">
      <div className="plan-details-header">
        <h2 className="plan-details-title">{planName}</h2>
        <button className="plan-details-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          &#9776;
        </button>
        {menuOpen && (
          <div className="plan-details-menu-overlay" onClick={() => setMenuOpen(false)}>
            <div className="plan-details-menu" onClick={e => e.stopPropagation()}>
              <button onClick={onBack}>Back</button>
              <button onClick={handleAddStage}>Add stage</button>
              <button onClick={handleClone}>Clone</button>
              <button onClick={handleDelete} className="plan-details-delete-btn">Delete</button>
            </div>
          </div>
        )}
      </div>
      <div className="plan-details-content">
        {loading && <div>Loading...</div>}
        {error && <div className="plan-details-error">{error}</div>}
        {plan && (
          <div>
            <div>
              <label htmlFor="plan-description" className="plan-details-description-label">Description:</label>
              <textarea
                id="plan-description"
                value={plan.description ?? ""}
                placeholder="Description"
                onChange={e => setPlan({ ...plan, description: e.target.value })}
                rows={3}
                className="plan-details-description-textarea"
              />
            </div>
            {/* Render stages or other plan details here */}
          </div>
        )}
      </div>
      <div className="plan-details-resources">
        <span
          className={`plan-details-sum-symbol ${resourcesNonNegative ? "plan-details-sum-green" : "plan-details-sum-red"}`}
        >
          &#931;
        </span>
        <span className="plan-details-resources-text">(dummy resources)</span>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
