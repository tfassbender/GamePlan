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
    } else if (val && typeof val === "object" && "type" in val && val.type === "terra_mystica_power") {
      resources[key] = {
        type: "terra_mystica_power",
        bowl1: val.bowl1,
        bowl2: val.bowl2,
        bowl3: val.bowl3,
        gain: val.gain ?? 0,
        burn: val.burn ?? 0,
        use: val.use ?? 0
      };
    } else if (val && typeof val === "object" && "type" in val && val.type === "terra_mystica_cults") {
      resources[key] = {
        type: "terra_mystica_cults",
        fire: val.fire,
        water: val.water,
        earth: val.earth,
        air: val.air
      };
    } else if (val && typeof val === "object" && "type" in val && val.type === "simple_combined") {
      resources[key] = {
        type: "simple_combined",
        resources: { ...val.resources },
        colors: val.colors ? { ...val.colors } : {} // Always assign an object
      };
    } else if (val && typeof val === "object" && "type" in val && val.type === "absolute") {
      resources[key] = { type: "absolute", value: val.value };
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
      if (change && typeof change === "object" && "type" in change && change.type === "absolute") {
        const prev = resources[key] && resources[key].type === "absolute" ? resources[key].value : null;
        resources[key] = { type: "absolute", value: change.value !== null ? change.value : prev };
      }
      if (change && typeof change === "object" && "type" in change && change.type === "terra_mystica_power") {
        let { bowl1, bowl2, bowl3, gain, burn, use } = change;
        // If all bowl inputs are zero, do not set the bowls, use previous values
        let prevPower = resources[key] && resources[key].type === "terra_mystica_power" ? resources[key] : { bowl1: 0, bowl2: 0, bowl3: 0 };
        let newBowl1, newBowl2, newBowl3;
        if ((bowl1 === 0) && (bowl2 === 0) && (bowl3 === 0)) {
          newBowl1 = prevPower.bowl1;
          newBowl2 = prevPower.bowl2;
          newBowl3 = prevPower.bowl3;
        } else {
          newBowl1 = bowl1;
          newBowl2 = bowl2;
          newBowl3 = bowl3;
        }
        // Apply "gain" effect
        for (let i = 0; i < (gain ?? 0); i++) {
          if (newBowl1 > 0) {
            newBowl1--;
            newBowl2++;
          } else if (newBowl2 > 0) {
            newBowl2--;
            newBowl3++;
          }
          // else do nothing
        }
        // Apply "burn" effect
        for (let i = 0; i < (burn ?? 0); i++) {
          newBowl2 -= 2;
          newBowl3 += 1;
        }
        // Apply "use" effect
        for (let i = 0; i < (use ?? 0); i++) {
          newBowl3--;
          newBowl1++;
        }
        resources[key] = {
          type: "terra_mystica_power",
          bowl1: newBowl1,
          bowl2: newBowl2,
          bowl3: newBowl3,
          gain: gain ?? 0,
          burn: burn ?? 0,
          use: use ?? 0
        };
        if (!allowNegative && (newBowl1 < 0 || newBowl2 < 0 || newBowl3 < 0)) isValid = false;
      }
      if (change && typeof change === "object" && "type" in change && change.type === "terra_mystica_cults") {
        const prev = resources[key] && resources[key].type === "terra_mystica_cults"
          ? resources[key]
          : { fire: 0, water: 0, earth: 0, air: 0 };
        const newFire = prev.fire + change.fire;
        const newWater = prev.water + change.water;
        const newEarth = prev.earth + change.earth;
        const newAir = prev.air + change.air;
        resources[key] = {
          type: "terra_mystica_cults",
          fire: newFire,
          water: newWater,
          earth: newEarth,
          air: newAir
        };
        if (!allowNegative && (newFire < 0 || newWater < 0 || newEarth < 0 || newAir < 0)) isValid = false;
      }
      if (change && typeof change === "object" && "type" in change && change.type === "simple_combined") {
        const prev = resources[key] && resources[key].type === "simple_combined"
          ? resources[key].resources
          : {};
        const newResources: Record<string, number> = {};
        for (const resKey in change.resources) {
          newResources[resKey] = (prev[resKey] || 0) + change.resources[resKey];
          if (!allowNegative && newResources[resKey] < 0) isValid = false;
        }
        // Also keep any resource keys from prev that are not in change
        for (const resKey in prev) {
          if (!(resKey in newResources)) {
            newResources[resKey] = prev[resKey];
          }
        }
        resources[key] = {
          type: "simple_combined",
          resources: newResources,
          colors: change.type === "simple_combined" && change.colors ? { ...change.colors } : (resources[key] && resources[key].type === "simple_combined" ? resources[key].colors : {})
        };
      }
    }
  }
  return { finalResources: resources, isValid };
}
