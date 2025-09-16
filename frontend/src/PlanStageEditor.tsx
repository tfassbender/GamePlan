import React from "react";
import ReactDOM from "react-dom";
import "./PlanStageEditor.css";
import { PlanStageDto, ResourceType, ResourceChangeValue, SimpleResourceChange, PowerResourceChange } from "./types";
import ResourceInput, { ResourceInputType } from "./ResourceInput";
import "./ResourceInput.css";
import { calculatePlanResources } from "./planResourceUtils";

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
}

const PlanStageEditor: React.FC<PlanStageEditorProps> = ({ index, stage, onChange, currentResources, resourceTypes, resourceOrder, onAddBefore, onAddAfter, onDelete, dragHandleProps, resourceInputVisibility, toggleResourceInputVisibility }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<{top: number, left: number} | null>(null);
  const menuBtnRef = React.useRef<HTMLButtonElement>(null);

  const handleAddBefore = () => {
    setMenuOpen(false);
    if (onAddBefore) onAddBefore();
  };
  const handleAddAfter = () => {
    setMenuOpen(false);
    if (onAddAfter) onAddAfter();
  };
  const handleClear = () => {
    setMenuOpen(false);
    onChange({ ...stage, description: "", resourceChanges: {} });
  };
  const handleDelete = () => {
    setMenuOpen(false);
    if (onDelete) onDelete();
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

  return (
    <div className="plan-stage-editor plan-stage-editor-debug">
      <div className="plan-stage-header">
        <span className="plan-stage-number" {...(dragHandleProps || {})} style={{ cursor: dragHandleProps ? 'grab' : undefined }}>
          {index + 1}
        </span>
        <textarea
          className="plan-stage-description"
          value={stage.description}
          placeholder="Stage description"
          rows={2}
          onChange={e => onChange({ ...stage, description: e.target.value })}
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
            <button onClick={handleAddBefore}>Add Stage Before</button>
            <button onClick={handleAddAfter}>Add Stage After</button>
            <button onClick={handleClear}>Clear Stage</button>
            <button onClick={handleDelete} className="plan-stage-menu-delete-btn">Delete Stage</button>
          </div>
        </>,
        document.body
      )}
      <div className="plan-stage-resources">
        {(resourceOrder
          ? [...resourceOrder, ...Object.keys(resourceTypes).filter(r => !resourceOrder.includes(r))]
          : Object.keys(resourceTypes)
        ).map(resource => {
          const resourceChange = stage.resourceChanges[resource];
          let value: any = 0;
          if (resourceTypes[resource] === ResourceType.TM_POWER) {
            value = (resourceChange && typeof resourceChange === "object" && resourceChange.type === "tm_power")
              ? resourceChange
              : { type: "tm_power", bowl1: 0, bowl2: 0, bowl3: 0 };
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
                [resource]: resourceTypes[resource] === ResourceType.TM_POWER
                  ? { type: "tm_power", ...newValue }
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
              value={value}
              onChange={handleResourceChange}
              type={resourceTypes[resource] === ResourceType.TM_POWER ? ResourceInputType.TM_POWER : ResourceInputType.SIMPLE}
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
          {Object.keys(resourceTypes).map(resource => {
            const res = finalResources[resource];
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

export default PlanStageEditor;