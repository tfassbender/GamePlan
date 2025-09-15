import React, { useState, useEffect } from "react";
import "./PlanDetailsPage.css";
import { fetchPlan, updatePlan, clonePlan, deletePlan } from "./api";
import { useConfirmDialog } from "./App";
import { ConfirmDialogType } from "./ConfirmDialog";
import { PlanDto, ResourceType, ResourceChangeValue } from "./types";
import PlanStageEditor from "./PlanStageEditor";
import { calculatePlanResources } from "./planResourceUtils";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";

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
  const { showConfirmDialog } = useConfirmDialog();

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

  const createEmptyResourceChange = (type: ResourceType): ResourceChangeValue => {
    if (type === ResourceType.TM_POWER) {
      return { type: "tm_power", bowl1: 0, bowl2: 0, bowl3: 0 };
    }
    return { type: "simple", value: 0 };
  };

  const handleAddStage = () => {
    if (!plan) return;
    const newStage = {
      description: "",
      resourceChanges: Object.fromEntries(
        Object.entries(plan.resourceTypes).map(([r, t]) => [r, createEmptyResourceChange(t)])
      )
    };
    setPlan({ ...plan, stages: [...plan.stages, newStage] });
    setMenuOpen(false);
  };

  const handleAddStageBefore = (idx: number) => {
    if (!plan) return;
    const newStage = {
      description: "",
      resourceChanges: Object.fromEntries(
        Object.entries(plan.resourceTypes).map(([r, t]) => [r, createEmptyResourceChange(t)])
      )
    };
    setPlan({
      ...plan,
      stages: [
        ...plan.stages.slice(0, idx),
        newStage,
        ...plan.stages.slice(idx)
      ]
    });
  };

  const handleAddStageAfter = (idx: number) => {
    if (!plan) return;
    const newStage = {
      description: "",
      resourceChanges: Object.fromEntries(
        Object.entries(plan.resourceTypes).map(([r, t]) => [r, createEmptyResourceChange(t)])
      )
    };
    setPlan({
      ...plan,
      stages: [
        ...plan.stages.slice(0, idx + 1),
        newStage,
        ...plan.stages.slice(idx + 1)
      ]
    });
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
    setMenuOpen(false);
    showConfirmDialog({
      title: "Delete Plan",
      message: `Are you sure you want to delete the plan '${planName}'? This action cannot be undone!`,
      type: ConfirmDialogType.DANGER,
      onConfirm: async () => {
        try {
          await deletePlan(username, planName);
          onBack();
        } catch (e: any) {
          setError(e?.response?.data?.message || "Failed to delete plan");
        }
      }
    });
  };

  // Calculate final resources and validity for the whole plan
  const finalResourceResult = plan ? calculatePlanResources(plan.stages, true) : { finalResources: {}, isValid: true };

  // Helper for dnd-kit sortable
  function SortableStage({ id, idx, stage, ...rest }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: transform ? `translateY(${transform.y}px)` : undefined,
          transition,
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 1000 : undefined,
        }}
      >
        <PlanStageEditor
          index={idx}
          stage={stage}
          dragHandleProps={{ ...attributes, ...listeners }}
          {...rest}
        />
      </div>
    );
  }

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
            <div className="plan-details-stages-list">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={event => {
                  const { active, over } = event;
                  if (active.id !== over?.id) {
                    const oldIndex = plan.stages.findIndex((_, i) => i.toString() === active.id);
                    const newIndex = plan.stages.findIndex((_, i) => i.toString() === over?.id);
                    if (oldIndex !== -1 && newIndex !== -1) {
                      const newStages = arrayMove(plan.stages, oldIndex, newIndex);
                      setPlan({ ...plan, stages: newStages });
                    }
                  }
                }}
              >
                <SortableContext
                  items={plan.stages.map((_, i) => i.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {plan.stages.map((stage, idx) => {
                    // Calculate resources before this stage
                    const resourcesBeforeStage = idx === 0
                      ? {} // start with zeroes
                      : calculatePlanResources(plan.stages.slice(0, idx), false).finalResources;
                    return (
                      <SortableStage
                        key={idx}
                        id={idx.toString()}
                        idx={idx}
                        stage={stage}
                        currentResources={resourcesBeforeStage}
                        resourceTypes={plan.resourceTypes}
                        onChange={(updatedStage: any) => {
                          const newStages = plan.stages.map((s, i) => i === idx ? updatedStage : s);
                          setPlan({ ...plan, stages: newStages });
                        }}
                        onAddBefore={() => handleAddStageBefore(idx)}
                        onAddAfter={() => handleAddStageAfter(idx)}
                        onDelete={() => {
                          setPlan({
                            ...plan,
                            stages: plan.stages.filter((_, i) => i !== idx)
                          });
                        }}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
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
          {plan && Object.keys(plan.resourceTypes).map(resource => {
            const res = finalResourceResult.finalResources[resource];
            let displayValue: string | number = 0;
            if (res && typeof res === "object" && "type" in res) {
              if (res.type === "simple") {
                displayValue = res.value;
              } else if (res.type === "tm_power") {
                displayValue = `${res.bowl1}-${res.bowl2}-${res.bowl3}`;
              }
            }
            return (
              <span key={resource} style={{ marginRight: "1em" }}>
                {resource}: {displayValue}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
