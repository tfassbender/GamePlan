import React, { useState } from "react";
import PlanStageEditor from "./PlanStageEditor";
import type { PlanStageDto, ResourceType } from "./types";

interface PlanStagesListProps {
  initialStages: PlanStageDto[];
  resourceTypes: Record<string, ResourceType>;
}

const emptyStage = (): PlanStageDto => ({
  description: "",
  resourceChanges: {}
});

const PlanStagesList: React.FC<PlanStagesListProps> = ({ initialStages, resourceTypes }) => {
  const [stages, setStages] = useState<PlanStageDto[]>(initialStages);

  const handleStageChange = (index: number, updatedStage: PlanStageDto) => {
    setStages(stages => stages.map((s, i) => (i === index ? updatedStage : s)));
  };

  const handleAddBefore = (index: number) => {
    setStages(stages => [
      ...stages.slice(0, index),
      emptyStage(),
      ...stages.slice(index)
    ]);
  };

  return (
    <div>
      {stages.map((stage, idx) => (
        <PlanStageEditor
          key={idx}
          index={idx}
          stage={stage}
          onChange={updated => handleStageChange(idx, updated)}
          resourceTypes={resourceTypes}
          onAddBefore={() => handleAddBefore(idx)}
        />
      ))}
    </div>
  );
};

export default PlanStagesList;

