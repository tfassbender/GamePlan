import type { PlanStageDto } from "./types";

export interface ResourceCalculationResult {
  finalResources: Record<string, number>;
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
  stages: PlanStageDto[],
  checkAllStages: boolean,
  initialResources: Record<string, number> = {}
): ResourceCalculationResult {
  // Clone initial resources to avoid mutation
  const resources: Record<string, number> = { ...initialResources };
  let isValid = true;

  for (const stage of stages) {
    for (const [resource, change] of Object.entries(stage.resourceChanges)) {
      resources[resource] = (resources[resource] || 0) + change;
    }
    if (checkAllStages) {
      if (Object.values(resources).some(v => v < 0)) {
        isValid = false;
      }
    }
  }
  if (!checkAllStages) {
    if (Object.values(resources).some(v => v < 0)) {
      isValid = false;
    }
  }
  return { finalResources: resources, isValid };
}

