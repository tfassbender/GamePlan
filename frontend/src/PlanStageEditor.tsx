import React from "react";
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
}

const PlanStageEditor: React.FC<PlanStageEditorProps> = ({ index, stage, onChange, currentResources, resourceTypes }) => {
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
      </div>
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