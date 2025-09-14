import React from "react";
import ReactDOM from "react-dom";
import "./PlanStageEditor.css";
import type { PlanStageDto, ResourceType } from "./types";
import ResourceInput from "./ResourceInput";
import "./ResourceInput.css";
import { calculatePlanResources } from "./planResourceUtils";

interface PlanStageEditorProps {
  index: number;
  stage: PlanStageDto;
  onChange: (stage: PlanStageDto) => void;
  currentResources?: Record<string, number>; // for future use
  resourceTypes: Record<string, ResourceType>;
  onAddBefore?: () => void;
  onAddAfter?: () => void;
  onDelete?: () => void;
}

const PlanStageEditor: React.FC<PlanStageEditorProps> = ({ index, stage, onChange, currentResources, resourceTypes, onAddBefore, onAddAfter, onDelete }) => {
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
        <span className="plan-stage-number">{index + 1}</span>
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
        {Object.keys(resourceTypes).map(resource => (
          <ResourceInput
            key={resource}
            resource={resource}
            value={stage.resourceChanges[resource] ?? 0}
            onChange={newValue => {
              const updatedResourceChanges = { ...stage.resourceChanges, [resource]: newValue };
              onChange({ ...stage, resourceChanges: updatedResourceChanges });
            }}
          />
        ))}
      </div>
      <div className="plan-stage-current-resources">
        <span
          className={`plan-details-sum-symbol ${isValid ? "plan-details-sum-green" : "plan-details-sum-red"}`}
        >
          &#931;
        </span>
        <span className="plan-details-resources-text">
          {Object.keys(resourceTypes).map(resource => (
            <span key={resource} style={{ marginRight: "1em" }}>
              {resource}: {finalResources[resource] ?? 0}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default PlanStageEditor;