import React, { useState } from "react";
import "./PlanDetailsPage.css";

interface PlanDetailsPageProps {
  username: string;
  planName: string;
  onBack: () => void;
}

const PlanDetailsPage: React.FC<PlanDetailsPageProps> = ({ username, planName, onBack }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Placeholder for resource state: true = all non-negative, false = negative at some point
  const [resourcesNonNegative, setResourcesNonNegative] = useState(true); // will be computed from plan steps in the future

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
        {/* Plan steps will go here */}
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
