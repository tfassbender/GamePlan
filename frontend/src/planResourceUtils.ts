import type { PlanStageDto, PowerResourceChange, ResourceChangeValue } from "./types";

export interface ResourceCalculationResult {
  finalResources: Record<string, ResourceChangeValue>;
  isValid: boolean;
}

/**
 * Calculates the final resources and validity of a plan.
 * @param stages The array of PlanStageDto.
 * @param checkAllStages If true, checks validity after every stage; if false, only after the last stage.
 * @param initialResources Optionally, the starting resources (default: all zero).
 * @returns { finalResources, isValid }
 */
export function calculatePlanResources(
  stages: any[],
  allowNegative: boolean,
  initialResources: Record<string, ResourceChangeValue> = {}
) {
  let resources: Record<string, ResourceChangeValue> = {};
  // Initialize resources
  for (const key in initialResources) {
    const val = initialResources[key];
    if (val && typeof val === "object" && "type" in val && val.type === "simple") {
      resources[key] = { type: "simple", value: val.value };
    } else if (val && typeof val === "object" && "type" in val && val.type === "tm_power") {
      resources[key] = { type: "tm_power", bowl1: val.bowl1, bowl2: val.bowl2, bowl3: val.bowl3 };
    }
  }
  let isValid = true;
  for (const stageIdx in stages) {
    const stage = stages[stageIdx];
    for (const key in stage.resourceChanges) {
      const change: ResourceChangeValue = stage.resourceChanges[key];
      if (change && typeof change === "object" && "type" in change && change.type === "simple") {
        const prev = resources[key] && resources[key].type === "simple" ? resources[key].value : 0;
        const newValue = prev + change.value;
        resources[key] = { type: "simple", value: newValue };
        if (!allowNegative && newValue < 0) isValid = false;
      }
      if (change && typeof change === "object" && "type" in change && change.type === "tm_power") {
        const { bowl1, bowl2, bowl3 } = change;
        if (bowl1 !== 0 || bowl2 !== 0 || bowl3 !== 0) {
          resources[key] = { type: "tm_power", bowl1, bowl2, bowl3 };
        }
      }
    }
  }
  return { finalResources: resources, isValid };
}
