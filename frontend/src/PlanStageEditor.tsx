import React from "react";
import type { PlanStageDto } from "./types";
import "./PlanStageEditor.css";
import ResourceInput from "./ResourceInput";
import "./ResourceInput.css";
import { calculatePlanResources } from "./planResourceUtils";

interface PlanStageEditorProps {
  index: number;
  stage: PlanStageDto;
  onChange: (stage: PlanStageDto) => void;
  currentResources?: Record<string, number>; // for future use
}

const PlanStageEditor: React.FC<PlanStageEditorProps> = ({ index, stage, onChange, currentResources }) => {
  // Calculate resources after this stage
  const stagesUpToCurrent = React.useMemo(() => [stage], [stage]);
  // If currentResources is provided, use it as the starting point; otherwise, use zeroes
  const { finalResources, isValid } = calculatePlanResources(
    [stage],
    false,
    currentResources || {}
  );
  return (
    <div className="plan-stage-editor">
      <div className="plan-stage-header">
        <span className="plan-stage-number">{index + 1}</span>
        <textarea
          className="plan-stage-description"
          value={stage.description}
          placeholder="Stage description"
          rows={2}
          onChange={e => onChange({ ...stage, description: e.target.value })}
        />
      </div>
      <div className="plan-stage-resources">
        {Object.entries(stage.resourceChanges).map(([resource, value]) => (
          <ResourceInput
            key={resource}
            resource={resource}
            value={value}
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
          {Object.entries(finalResources).map(([resource, value]) => (
            <span key={resource} style={{ marginRight: "1em" }}>
              {resource}: {value}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default PlanStageEditor;
