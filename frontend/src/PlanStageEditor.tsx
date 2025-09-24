import React from "react";
import ReactDOM from "react-dom";
import "./PlanStageEditor.css";
import { PlanStageDto, ResourceType, ResourceChangeValue, SimpleResourceChange, PowerResourceChange } from "./common/types";
import ResourceInput, { ResourceInputType } from "./resourceInputs/ResourceInput";
import "./resourceInputs/ResourceInput.css";
import { calculatePlanResources } from "./common/planResourceUtils";
import { FaPlus, FaArrowUp, FaArrowDown, FaBroom, FaTrash } from 'react-icons/fa';
import { isColorDark } from "./common/colorUtils";

interface PlanStageEditorProps {
  index: number;
  stage: PlanStageDto;
  onChange: (stage: PlanStageDto) => void;
  currentResources?: Record<string, ResourceChangeValue>;
  resourceTypes: Record<string, ResourceType>;
  resourceOrder?: string[];
  onAddBefore?: () => void;
  onAddAfter?: () => void;
  onDelete?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
  resourceInputVisibility?: Record<string, boolean>;
  toggleResourceInputVisibility?: (resource: string) => void;
  setAllResourceInputsVisibility?: (visible: boolean) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isOnlyStage?: boolean;
}

const PlanStageEditor: React.FC<PlanStageEditorProps> = ({
  index,
  stage,
  onChange,
  currentResources,
  resourceTypes,
  resourceOrder,
  onAddBefore,
  onAddAfter,
  onDelete,
  dragHandleProps,
  resourceInputVisibility,
  toggleResourceInputVisibility,
  setAllResourceInputsVisibility,
  onMoveUp,
  onMoveDown,
  isOnlyStage = false,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<{top: number, left: number} | null>(null);
  const menuBtnRef = React.useRef<HTMLButtonElement>(null);

  // Local state for textarea value to prevent focus loss
  const [localDescription, setLocalDescription] = React.useState(stage.description);
  React.useEffect(() => {
    setLocalDescription(stage.description);
  }, [stage.description]);

  const handleAddBefore = () => {
    setMenuOpen(false);
    if (onAddBefore) onAddBefore();
  };
  const handleAddAfter = () => {
    setMenuOpen(false);
    if (onAddAfter) onAddAfter();
  };
  function clearStageResources(stage: PlanStageDto, resourceTypes: Record<string, ResourceType>): Record<string, ResourceChangeValue> {
    const clearedResourceChanges: Record<string, ResourceChangeValue> = {};
    Object.entries(stage.resourceChanges).forEach(([key, value]) => {
      if (value && typeof value === "object" && value.type === "simple_combined") {
        clearedResourceChanges[key] = {
          ...value,
          resources: Object.fromEntries(Object.keys(value.resources || {}).map(k => [k, 0]))
        };
      } else {
        const type = resourceTypes[key];
        if (type === ResourceType.SIMPLE) {
          clearedResourceChanges[key] = { type: "simple", value: 0 };
        } else if (type === ResourceType.ABSOLUTE) {
          clearedResourceChanges[key] = { type: "absolute", value: null };
        } else if (type === ResourceType.TERRA_MYSTICA_POWER) {
          clearedResourceChanges[key] = { type: "terra_mystica_power", bowl1: 0, bowl2: 0, bowl3: 0, gain: 0, burn: 0, use: 0 };
        } else if (type === ResourceType.TERRA_MYSTICA_CULTS) {
          clearedResourceChanges[key] = { type: "terra_mystica_cults", fire: 0, water: 0, earth: 0, air: 0 };
        } else {
          clearedResourceChanges[key] = value as ResourceChangeValue;
        }
      }
    });
    return clearedResourceChanges;
  }

  const handleClear = () => {
    setMenuOpen(false);
    const clearedResourceChanges = clearStageResources(stage, resourceTypes);
    onChange({ ...stage, description: "", resourceChanges: clearedResourceChanges });
  };
  const handleDelete = () => {
    setMenuOpen(false);
    if (isOnlyStage) {
      const clearedResourceChanges = clearStageResources(stage, resourceTypes);
      onChange({ ...stage, description: "", resourceChanges: clearedResourceChanges });
    } else if (onDelete) {
      onDelete();
    }
  };
  // Move up/down handlers
  const handleMoveUp = () => {
    setMenuOpen(false);
    if (onMoveUp) onMoveUp();
  };
  const handleMoveDown = () => {
    setMenuOpen(false);
    if (onMoveDown) onMoveDown();
  };

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 200 // 200px is menu width, adjust as needed
      });
    }
    setMenuOpen(true);
  };

  // Calculate resources after this stage
  const stagesUpToCurrent = React.useMemo(() => [stage], [stage]);
  // If currentResources is provided, use it as the starting point; otherwise, use zeroes
  const { finalResources, isValid } = calculatePlanResources(
    [stage],
    false,
    currentResources || {}
  );

  // Compute if all resource inputs are visible
  const allVisible = resourceInputVisibility
    ? Object.values(resourceInputVisibility).every(v => v)
    : true;
  const allHidden = resourceInputVisibility
    ? Object.values(resourceInputVisibility).every(v => !v)
    : false;

  return (
    <div className="plan-stage-editor plan-stage-editor-debug">
      <div className="plan-stage-header">
        <span className="plan-stage-number" {...(dragHandleProps || {})} style={{ cursor: dragHandleProps ? 'grab' : undefined }}>
          {index + 1}
        </span>
        <textarea
          className="plan-stage-description"
          key={`plan-stage-description-${index}`}
          value={localDescription}
          placeholder="Stage description"
          rows={2}
          onChange={e => {
            setLocalDescription(e.target.value);
          }}
          onBlur={() => {
            if (localDescription !== stage.description) {
              onChange({ ...stage, description: localDescription });
            }
          }}
        />
        <button
          className="plan-stage-menu-btn"
          ref={menuBtnRef}
          onClick={openMenu}
          aria-label="Open stage menu"
        >
          &#9776;
        </button>
      </div>
      {menuOpen && menuPosition && ReactDOM.createPortal(
        <>
          <div
            className="plan-stage-menu-popover-modal"
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000 }}
          />
          <div
            className="plan-stage-menu plan-stage-menu-popover-inner"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: menuPosition.top,
              left: menuPosition.left - 50,
              zIndex: 2001
            }}
          >
            <button onClick={handleAddBefore}>
              <span className="plan-stage-menu-icon"><FaPlus /></span> Add Stage Before
            </button>
            <button onClick={handleAddAfter}>
              <span className="plan-stage-menu-icon"><FaPlus /></span> Add Stage After
            </button>
            <div className="plan-stage-menu-move-row">
              <button className="plan-stage-menu-move-btn" onClick={handleMoveUp} aria-label="Move Up">
                <span className="plan-stage-menu-icon"><FaArrowUp /></span>
              </button>
              <button className="plan-stage-menu-move-btn" onClick={handleMoveDown} aria-label="Move Down">
                <span className="plan-stage-menu-icon"><FaArrowDown /></span>
              </button>
            </div>
            <button onClick={handleClear}>
              <span className="plan-stage-menu-icon"><FaBroom /></span> Clear Stage
            </button>
            <button onClick={handleDelete} className="plan-stage-menu-delete-btn">
              <span className="plan-stage-menu-icon"><FaTrash /></span> Delete Stage
            </button>
          </div>
        </>,
        document.body
      )}
      {resourceInputVisibility && setAllResourceInputsVisibility && (
        <div className="plan-stage-toggle-all">
          <input
            type="checkbox"
            checked={allVisible}
            onChange={e => setAllResourceInputsVisibility(e.target.checked)}
          />
          Show / hide all inputs
        </div>
      )}
      <div className="plan-stage-resources">
        {(resourceOrder
          ? [...resourceOrder, ...Object.keys(resourceTypes).filter(r => !resourceOrder.includes(r))]
          : Object.keys(resourceTypes)
        ).map(resource => {
          const resourceChange = stage.resourceChanges[resource];
          let value: any = 0;
          if (resourceTypes[resource] === ResourceType.TERRA_MYSTICA_POWER) {
            value = (resourceChange && typeof resourceChange === "object" && resourceChange.type === "terra_mystica_power")
              ? resourceChange
              : { type: "terra_mystica_power", bowl1: 0, bowl2: 0, bowl3: 0, gain: 0, burn: 0, use: 0 };
          } else if (resourceTypes[resource] === ResourceType.TERRA_MYSTICA_CULTS) {
            value = (resourceChange && typeof resourceChange === "object" && resourceChange.type === "terra_mystica_cults")
              ? resourceChange
              : { type: "terra_mystica_cults", fire: 0, water: 0, earth: 0, air: 0 };
          } else if (resourceTypes[resource] === ResourceType.SIMPLE_COMBINED) {
            value = (resourceChange && typeof resourceChange === "object" && resourceChange.type === "simple_combined")
              ? resourceChange
              : { type: "simple_combined", resources: {}, colors: {} };
          } else if (resourceTypes[resource] === ResourceType.ONE_TIME_COMBINED) {
            // Only check for 'one_time_combined' type if resourceType matches
            value = (resourceChange && typeof resourceChange === "object" && 'type' in resourceChange && resourceChange.type === "one_time_combined")
              ? resourceChange
              : { type: "one_time_combined", resources: {}, colors: {} };
          } else if (resourceTypes[resource] === ResourceType.ABSOLUTE) {
            value = (resourceChange && typeof resourceChange === "object" && resourceChange.type === "absolute")
              ? resourceChange.value
              : null;
          } else {
            value = (resourceChange && typeof resourceChange === "object" && resourceChange.type === "simple")
              ? resourceChange.value
              : 0;
          }
          const handleResourceChange = (newValue: any) => {
            onChange({
              ...stage,
              resourceChanges: {
                ...stage.resourceChanges,
                [resource]: resourceTypes[resource] === ResourceType.TERRA_MYSTICA_POWER
                  ? { type: "terra_mystica_power", ...newValue }
                  : resourceTypes[resource] === ResourceType.TERRA_MYSTICA_CULTS
                  ? { type: "terra_mystica_cults", ...newValue }
                  : resourceTypes[resource] === ResourceType.SIMPLE_COMBINED
                  ? { type: "simple_combined", ...newValue }
                  : resourceTypes[resource] === ResourceType.ONE_TIME_COMBINED
                  ? { type: "one_time_combined", ...newValue }
                  : resourceTypes[resource] === ResourceType.ABSOLUTE
                  ? { type: "absolute", value: newValue }
                  : { type: "simple", value: newValue }
              }
            });
          };
          // If visibility props are not provided, always show details and do not render the checkbox
          const showDetails = resourceInputVisibility ? (resourceInputVisibility[resource] ?? true) : true;
          const onToggleShowDetails = toggleResourceInputVisibility ? () => toggleResourceInputVisibility(resource) : undefined;
          return (
            <ResourceInput
              key={resource}
              resource={resource}
              {...(resourceTypes[resource] === ResourceType.TERRA_MYSTICA_CULTS
                ? { value: { fire: value.fire, water: value.water, earth: value.earth, air: value.air } }
                : resourceTypes[resource] === ResourceType.SIMPLE_COMBINED
                ? { value: { resources: value.resources, colors: value.colors } }
                : resourceTypes[resource] === ResourceType.ONE_TIME_COMBINED
                ? { value: { resources: value.resources, colors: value.colors } }
                : { value })}
              onChange={handleResourceChange}
              type={getResourceInputType(resourceTypes[resource])}
              showDetails={showDetails}
              onToggleShowDetails={onToggleShowDetails}
            />
          );
        })}
      </div>
      <div className="plan-stage-current-resources">
        <span
          className={`plan-details-sum-symbol ${isValid ? "plan-details-sum-green" : "plan-details-sum-red"}`}
        >
          &#931;
        </span>
        <span className="plan-details-resources-text">
          {(resourceOrder
            ? [...resourceOrder, ...Object.keys(resourceTypes).filter(r => !resourceOrder.includes(r))]
            : Object.keys(resourceTypes)
          ).map(resource => {
            const res = finalResources[resource];
            return (
              <span key={resource} className="plan-details-resource-pair">
                {resource}: {(() => {
                  if (res && typeof res === "object" && "type" in res) {
                    if (res.type === "simple") {
                      // No color available for simple resources, just show value
                      return (
                        <span className="plan-details-resources-simple">{res.value}</span>
                      );
                    } else if (res.type === "terra_mystica_power") {
                      return (
                        <span className="plan-details-power-purple">
                          {`${res.bowl1 < 0 ? `'${res.bowl1}'` : res.bowl1}-${res.bowl2 < 0 ? `'${res.bowl2}'` : res.bowl2}-${res.bowl3 < 0 ? `'${res.bowl3}'` : res.bowl3}`}
                        </span>
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
                    } else if (res.type === "simple_combined") {
                      const entries = Object.entries(res.resources || {});
                      return (
                        <>
                          {entries.map(([key, val], idx) => {
                            const bgColor = res.colors && res.colors[key] ? res.colors[key] : undefined;
                            let textColor = undefined;
                            if (bgColor && /^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
                              textColor = isColorDark(bgColor) ? '#fff' : '#222';
                            }
                            return (
                              <React.Fragment key={key}>
                                <span className="plan-details-resources-value-bg" style={{ background: bgColor, color: textColor }}>{val}</span>
                              </React.Fragment>
                            );
                          })}
                        </>
                      );
                    } else if (res.type === "absolute") {
                      return (
                        <span className="plan-details-resources-absolute">{res.value !== null ? res.value : "N/A"}</span>
                      );
                    }
                  }
                  return 0;
                })()}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
};

export default PlanStageEditor;

// Utility to map ResourceType to ResourceInputType
function getResourceInputType(type: ResourceType): ResourceInputType {
  switch (type) {
    case ResourceType.TERRA_MYSTICA_POWER:
      return ResourceInputType.TERRA_MYSTICA_POWER;
    case ResourceType.TERRA_MYSTICA_CULTS:
      return ResourceInputType.TERRA_MYSTICA_CULTS;
    case ResourceType.SIMPLE_COMBINED:
      return ResourceInputType.SIMPLE_COMBINED;
    case ResourceType.ABSOLUTE:
      return ResourceInputType.ABSOLUTE;
    case ResourceType.ONE_TIME_COMBINED:
      return ResourceInputType.ONE_TIME_COMBINED;
    default:
      return ResourceInputType.SIMPLE;
  }
}
