import React, { useState, useEffect } from "react";
import "./PlanDetailsPage.css";
import { fetchPlan, updatePlan, clonePlan, deletePlan } from "./common/api";
import { useConfirmDialog } from "./App";
import { ConfirmDialogType } from "./ConfirmDialog";
import { PlanDto, ResourceType, ResourceChangeValue, PlanStageDto } from "./common/types";
import PlanStageEditor from "./PlanStageEditor";
import { calculatePlanResources } from "./common/planResourceUtils";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import ResourceInput, { ResourceInputType } from "./resourceInputs/ResourceInput";
import "./resourceInputs/ResourceInput.css";
import { FaArrowLeft, FaPlus, FaEye, FaEyeSlash, FaClone, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faMinus } from "@fortawesome/free-solid-svg-icons";
import { isColorDark } from "./common/colorUtils";

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

  // Visibility state for all stages/resources
  const [resourceInputVisibility, setResourceInputVisibility] = useState<Record<number, Record<string, boolean>>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPlan(username, planName)
      .then((data: PlanDto) => {
        setPlan(data);
        setLoading(false);
      })
      .catch((err: Error) => {
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
        .catch((err: Error) => {
          // Optionally handle error (e.g., show a message)
        });
    }, 300);
    return () => clearTimeout(handler);
  }, [plan?.description, plan?.stages]);

  // Ensure all resources for all stages are initialized to true
  useEffect(() => {
    if (!plan) return;
    setResourceInputVisibility(prev => {
      const updated = { ...prev };
      plan.stages.forEach((stage: PlanStageDto, idx: number) => {
        if (!updated[idx]) updated[idx] = {};
        Object.keys(plan.resourceTypes).forEach(resource => {
          if (updated[idx][resource] === undefined) {
            updated[idx][resource] = true;
          }
        });
      });
      return updated;
    });
  }, [plan, plan?.resourceTypes]);

  const createEmptyResourceChange = (
    type: ResourceType,
    resources: Record<string, any> = {},
    colors: Record<string, string> = {}
  ): ResourceChangeValue => {
    if (type === ResourceType.TERRA_MYSTICA_POWER) {
      return { type: "terra_mystica_power", bowl1: 0, bowl2: 0, bowl3: 0, gain: 0, burn: 0, use: 0 };
    }
    if (type === ResourceType.SIMPLE_COMBINED) {
      const zeroedResources = Object.fromEntries(Object.keys(resources).map(key => [key, 0]));
      return { type: "simple_combined", resources: zeroedResources, colors };
    }
    if (type === ResourceType.ONE_TIME_COMBINED) {
      // Set all values to null, keep keys and colors
      return { type: "one_time_combined", resources, colors };
    }
    if (type === ResourceType.ABSOLUTE) {
      return { type: "absolute", value: null };
    }
    return { type: "simple", value: 0 };
  };

  const handleAddStage = () => {
    if (!plan) return;
    const prevStage = plan.stages[plan.stages.length - 1];
    const newStage = {
      description: "",
      resourceChanges: Object.fromEntries(
        Object.entries(plan.resourceTypes).map(([r, t]) => {
          let resources = {};
          let colors = {};
          if (prevStage && prevStage.resourceChanges[r]) {
            if (prevStage.resourceChanges[r].type === "simple_combined") {
              resources = prevStage.resourceChanges[r].resources || {};
              colors = prevStage.resourceChanges[r].colors || {};
            } else if (prevStage.resourceChanges[r].type === "one_time_combined") {
              // Copy keys, set all values to null, keep colors
              const prevResources = prevStage.resourceChanges[r].resources || {};
              resources = Object.fromEntries(Object.keys(prevResources).map(k => [k, null]));
              colors = prevStage.resourceChanges[r].colors || {};
            }
          }
          return [r, createEmptyResourceChange(t, resources, colors)];
        })
      )
    };
    setPlan({
      ...plan,
      stages: [...plan.stages, newStage],
      name: plan.name,
      gameName: plan.gameName,
      description: plan.description,
      lastModified: plan.lastModified,
      resourceTypes: plan.resourceTypes,
      resourceOrder: plan.resourceOrder
    });
    setMenuOpen(false);
  };

  const handleAddStageBefore = (idx: number) => {
    if (!plan) return;
    const prevStage = plan.stages[idx - 1];
    const newStage = {
      description: "",
      resourceChanges: Object.fromEntries(
        Object.entries(plan.resourceTypes).map(([r, t]) => {
          let resources = {};
          let colors = {};
          if (prevStage && prevStage.resourceChanges[r]) {
            if (prevStage.resourceChanges[r].type === "simple_combined") {
              resources = prevStage.resourceChanges[r].resources || {};
              colors = prevStage.resourceChanges[r].colors || {};
            } else if (prevStage.resourceChanges[r].type === "one_time_combined") {
              const prevResources = prevStage.resourceChanges[r].resources || {};
              resources = Object.fromEntries(Object.keys(prevResources).map(k => [k, null]));
              colors = prevStage.resourceChanges[r].colors || {};
            }
          }
          return [r, createEmptyResourceChange(t, resources, colors)];
        })
      )
    };
    setPlan({
      ...plan,
      stages: [
        ...plan.stages.slice(0, idx),
        newStage,
        ...plan.stages.slice(idx)
      ],
      name: plan.name,
      gameName: plan.gameName,
      description: plan.description,
      lastModified: plan.lastModified,
      resourceTypes: plan.resourceTypes,
      resourceOrder: plan.resourceOrder
    });
  };

  const handleAddStageAfter = (idx: number) => {
    if (!plan) return;
    const prevStage = plan.stages[idx];
    const newStage = {
      description: "",
      resourceChanges: Object.fromEntries(
        Object.entries(plan.resourceTypes).map(([r, t]) => {
          let resources = {};
          let colors = {};
          if (prevStage && prevStage.resourceChanges[r]) {
            if (prevStage.resourceChanges[r].type === "simple_combined") {
              resources = prevStage.resourceChanges[r].resources || {};
              colors = prevStage.resourceChanges[r].colors || {};
            } else if (prevStage.resourceChanges[r].type === "one_time_combined") {
              const prevResources = prevStage.resourceChanges[r].resources || {};
              resources = Object.fromEntries(Object.keys(prevResources).map(k => [k, null]));
              colors = prevStage.resourceChanges[r].colors || {};
            }
          }
          return [r, createEmptyResourceChange(t, resources, colors)];
        })
      )
    };
    setPlan({
      ...plan,
      stages: [
        ...plan.stages.slice(0, idx + 1),
        newStage,
        ...plan.stages.slice(idx + 1)
      ],
      name: plan.name,
      gameName: plan.gameName,
      description: plan.description,
      lastModified: plan.lastModified,
      resourceTypes: plan.resourceTypes,
      resourceOrder: plan.resourceOrder
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
  const finalResourceResult = plan ? calculatePlanResources(plan.stages, false) : { finalResources: {}, isValid: true };

  // Helper for dnd-kit sortable
  function SortableStage({ id, idx, stage, ...rest }: { id: string, idx: number, stage: PlanStageDto, [key: string]: any }) {
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
          resourceTypes={plan ? plan.resourceTypes : {}}
          resourceOrder={plan ? plan.resourceOrder : []}
          onChange={(updatedStage: PlanStageDto) => {
            if (!plan) return;
            const newStages = plan.stages.map((s: PlanStageDto, i: number) => i === idx ? updatedStage : s);
            setPlan({
              ...plan,
              stages: newStages,
              name: plan.name,
              gameName: plan.gameName,
              description: plan.description,
              lastModified: plan.lastModified,
              resourceTypes: plan.resourceTypes,
              resourceOrder: plan.resourceOrder
            });
          }}
          onAddBefore={() => handleAddStageBefore(idx)}
          onAddAfter={() => handleAddStageAfter(idx)}
          onDelete={() => {
            if (!plan) return;
            setPlan({
              ...plan,
              stages: plan.stages.filter((_, i) => i !== idx),
              name: plan.name,
              gameName: plan.gameName,
              description: plan.description,
              lastModified: plan.lastModified,
              resourceTypes: plan.resourceTypes,
              resourceOrder: plan.resourceOrder
            });
          }}
          resourceInputVisibility={resourceInputVisibility[idx] ?? {}}
          toggleResourceInputVisibility={(resource: string) => toggleResourceInputVisibility(idx, resource)}
          setAllResourceInputsVisibility={(visible: boolean) => setAllResourceInputsVisibility(idx, visible)}
          onMoveUp={idx > 0 ? () => handleMoveUp(idx) : undefined}
          onMoveDown={idx < (plan ? plan.stages.length - 1 : 0) ? () => handleMoveDown(idx) : undefined}
          isOnlyStage={plan ? plan.stages.length === 1 : false}
          {...rest}
        />
      </div>
    );
  }

  // Helper to toggle visibility for a specific stage/resource
  const toggleResourceInputVisibility = (stageIdx: number, resource: string) => {
    setResourceInputVisibility(prev => {
      const stageVisibility = prev[stageIdx] ? { ...prev[stageIdx] } : {};
      const current = stageVisibility[resource];
      // If undefined, treat as true, so first click sets to false
      stageVisibility[resource] = current === undefined ? false : !current;
      return { ...prev, [stageIdx]: stageVisibility };
    });
  };

  // Helper to set all resource input visibilities for a stage
  const setAllResourceInputsVisibility = (stageIdx: number, visible: boolean) => {
    setResourceInputVisibility(prev => {
      const stageVisibility = { ...prev[stageIdx] };
      if (plan && plan.resourceTypes) {
        Object.keys(plan.resourceTypes).forEach(resource => {
          stageVisibility[resource] = visible;
        });
      }
      return { ...prev, [stageIdx]: stageVisibility };
    });
  };

  const setAllResourceInputsVisibilityAllStages = (visible: boolean) => {
    if (!plan || !plan.stages || !plan.resourceTypes) return;
    setResourceInputVisibility(prev => {
      const updated: Record<number, Record<string, boolean>> = { ...prev };
      plan.stages.forEach((stage, idx) => {
        updated[idx] = updated[idx] ? { ...updated[idx] } : {};
        Object.keys(plan.resourceTypes).forEach(resource => {
          updated[idx][resource] = visible;
        });
      });
      return updated;
    });
  };

  const handleMoveUp = (idx: number) => {
    if (!plan || idx <= 0) return;
    const newStages = [...plan.stages];
    [newStages[idx - 1], newStages[idx]] = [newStages[idx], newStages[idx - 1]];
    setPlan({ ...plan, stages: newStages });
  };

  const handleMoveDown = (idx: number) => {
    if (!plan || idx >= plan.stages.length - 1) return;
    const newStages = [...plan.stages];
    [newStages[idx], newStages[idx + 1]] = [newStages[idx + 1], newStages[idx]];
    setPlan({ ...plan, stages: newStages });
  };

  const handleOpenFeatures = () => {
    setMenuOpen(false);
    navigate('/app/features');
  };

  const handleShowAllInputs = () => {
    setAllResourceInputsVisibilityAllStages(true);
    setMenuOpen(false);
  };

  const handleHideAllInputs = () => {
    setAllResourceInputsVisibilityAllStages(false);
    setMenuOpen(false);
  };

  return (
    <div className="plan-details-container">
      <div className="plan-details-header">
        <img src="/app/icons/logo.png" alt="GamePlan Logo" className="plan-details-logo" />
        <h2 className="plan-details-title">{planName}</h2>
        <button className="plan-details-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          &#9776;
        </button>
        {menuOpen && (
          <div className="plan-details-menu-overlay" onClick={() => setMenuOpen(false)}>
            <div className="plan-details-menu" onClick={e => e.stopPropagation()}>
              <button onClick={onBack}><span className="plan-details-menu-icon"><FaArrowLeft /></span> Back</button>
              <button onClick={handleAddStage}><span className="plan-details-menu-icon"><FaPlus /></span> Add stage</button>
              {plan && plan.stages.length > 0 && plan.resourceTypes && (
                <>
                  <button onClick={handleShowAllInputs}>
                    <span className="plan-details-menu-icon"><FaEye /></span> Show All Inputs
                  </button>
                  <button onClick={handleHideAllInputs}>
                    <span className="plan-details-menu-icon"><FaEyeSlash /></span> Hide All Inputs
                  </button>
                </>
              )}
              <button onClick={handleClone}><span className="plan-details-menu-icon"><FaClone /></span> Clone</button>
              <button onClick={handleOpenFeatures}><span className="plan-details-menu-icon"><FaInfoCircle /></span> Features</button>
              <button onClick={handleDelete} className="plan-details-delete-btn"><span className="plan-details-menu-icon"><FaTrash /></span> Delete</button>
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
                        resourceTypes={plan?.resourceTypes ?? {}}
                        resourceOrder={plan?.resourceOrder ?? []}
                        onChange={(updatedStage: PlanStageDto) => {
                          const newStages = plan.stages.map((s: PlanStageDto, i: number) => i === idx ? updatedStage : s);
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
                        resourceInputVisibility={resourceInputVisibility[idx] ?? {}}
                        toggleResourceInputVisibility={(resource: string) => toggleResourceInputVisibility(idx, resource)}
                        setAllResourceInputsVisibility={(visible: boolean) => setAllResourceInputsVisibility(idx, visible)}
                        onMoveUp={idx > 0 ? () => handleMoveUp(idx) : undefined}
                        onMoveDown={idx < plan.stages.length - 1 ? () => handleMoveDown(idx) : undefined}
                        isOnlyStage={plan.stages.length === 1}
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
            if (res && typeof res === "object" && "type" in res) {
              if (res.type === "simple") {
                return (
                  <span key={resource} className="plan-details-resource-pair">{resource}: <span className="plan-details-resources-simple">{res.value}</span></span>
                );
              } else if (res.type === "simple_combined") {
                const entries = Object.entries(res.resources || {});
                return (
                  <span key={resource} className="plan-details-resource-pair">{resource}: <span className="plan-details-resource-simple-combined">
                    {entries.map(([key, val]) => {
                      const bgColor = res.colors && res.colors[key] ? res.colors[key] : undefined;
                      let textColor = undefined;
                      if (bgColor && /^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
                        textColor = isColorDark(bgColor) ? '#fff' : '#222';
                      }
                      return (
                        <span key={key} className="plan-details-resources-value-bg" style={{ background: bgColor, color: textColor }}>{val}</span>
                      );
                    })}
                  </span></span>
                );
              } else if (res.type === "absolute") {
                return (
                  <span key={resource} className="plan-details-resource-pair">{resource}: <span className="plan-details-resources-absolute">{res.value !== null ? res.value : "N/A"}</span></span>
                );
              } else if (res.type === "terra_mystica_power") {
                return (
                  <span key={resource} className="plan-details-resource-pair">{resource}: <span className="plan-details-power-purple">{`${res.bowl1 < 0 ? `'${res.bowl1}'` : res.bowl1}-${res.bowl2 < 0 ? `'${res.bowl2}'` : res.bowl2}-${res.bowl3 < 0 ? `'${res.bowl3}'` : res.bowl3}`}</span></span>
                );
              } else if (res.type === "terra_mystica_cults") {
                return (
                  <>
                    <span className="plan-details-cults-fire">{res.fire}</span>
                    -<span className="plan-details-cults-water">{res.water}</span>
                    -<span className="plan-details-cults-earth">{res.earth}</span>
                    -<span className="plan-details-cults-air">{res.air}</span>
                  </>
                );
              } else if (res.type === "one_time_combined") {
                const entries = Object.entries(res.resources || {});
                return (
                  <span key={resource} className="plan-details-resource-pair">{resource}: <span className="plan-details-resource-one-time-combined">
                    {entries.map(([key, val]) => {
                      const bgColor = res.colors && res.colors[key] ? res.colors[key] : undefined;
                      let textColor = undefined;
                      if (bgColor && /^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
                        textColor = isColorDark(bgColor) ? '#fff' : '#222';
                      }
                      let icon;
                      if (val === true) icon = <FontAwesomeIcon icon={faCheck} />;
                      else if (val === false) icon = <FontAwesomeIcon icon={faTimes} />;
                      else icon = <FontAwesomeIcon icon={faMinus} />;
                      return (
                        <span key={key} className="plan-details-resources-value-bg plan-details-resource-one-time-combined" style={{ background: bgColor, color: textColor }}>{icon}</span>
                      );
                    })}
                  </span></span>
                );
              }
            }
            return null;
          })}
        </span>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
