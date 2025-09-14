import React, { useState, useEffect } from "react";
import "./PlanDetailsPage.css";
import { fetchPlan, updatePlan, clonePlan } from "./api";
import type { PlanDto } from "./types";
import PlanStageEditor from "./PlanStageEditor";
import { calculatePlanResources } from "./planResourceUtils";

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

  // Debounced update effect for plan description and stages
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
  }, [plan?.description, plan?.stages]);

  const handleAddStage = () => {
    if (!plan) return;
    // Create a new stage with all resource types set to 0
    const newStage = {
      description: "",
      resourceChanges: Object.fromEntries(Object.keys(plan.resourceTypes).map(r => [r, 0]))
    };
    setPlan({ ...plan, stages: [...plan.stages, newStage] });
    setMenuOpen(false);
  };

  const navigate = (window as any).appNavigate || ((url: string) => { window.location.href = url; });

  const handleClone = async () => {
    if (!plan) return;
    setMenuOpen(false);
    try {
      const clonedPlan = await clonePlan(username, plan.name);
      // Use react-router navigate if available, otherwise fallback
      if ((window as any).appNavigate) {
        (window as any).appNavigate(`/app/${username}/plan/${clonedPlan.name}`);
      } else {
        window.location.href = `/app/${username}/plan/${clonedPlan.name}`;
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to clone plan");
    }
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    setMenuOpen(false);
    alert("Delete plan (not implemented)");
  };

  // Calculate final resources and validity for the whole plan
  const finalResourceResult = plan ? calculatePlanResources(plan.stages, true) : { finalResources: {}, isValid: true };

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
            <div className="plan-details-stages-list">
              {plan.stages.map((stage, idx) => {
                // Calculate resources before this stage
                const resourcesBeforeStage = idx === 0
                  ? {} // start with zeroes
                  : calculatePlanResources(plan.stages.slice(0, idx), false).finalResources;
                return (
                  <PlanStageEditor
                    key={idx}
                    index={idx}
                    stage={stage}
                    currentResources={resourcesBeforeStage}
                    resourceTypes={plan.resourceTypes}
                    onChange={updatedStage => {
                      const newStages = plan.stages.map((s, i) => i === idx ? updatedStage : s);
                      setPlan({ ...plan, stages: newStages });
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="plan-details-resources">
        <span
          className={`plan-details-sum-symbol ${finalResourceResult.isValid ? "plan-details-sum-green" : "plan-details-sum-red"}`}
        >
          &#931;
        </span>
        <span className="plan-details-resources-text">
          {plan && Object.keys(plan.resourceTypes).map(resource => (
            <span key={resource} style={{ marginRight: "1em" }}>
              {resource}: {finalResourceResult.finalResources[resource] ?? 0}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
