export interface PlanStageDto {
  description: string;
  resourceChanges: Record<string, ResourceChangeValue>;
}

export interface PlanDto {
  name: string;
  gameName: string;
  description: string;
  lastModified: string;
  resourceTypes: Record<string, ResourceType>;
  resourceOrder: string[];
  stages: PlanStageDto[];
}

export enum ResourceType {
  SIMPLE = "SIMPLE",
  TM_POWER = "TM_POWER",
  TM_CULTS = "TM_CULTS"
  // Add more types as needed
}

export type ResourceChangeValue = SimpleResourceChange | PowerResourceChange | TerraMysticaCultsResourceChange;

export interface SimpleResourceChange {
  type: "simple";
  value: number;
}

export interface PowerResourceChange {
  type: "tm_power";
  bowl1: number;
  bowl2: number;
  bowl3: number;
  gain: number;
  burn: number;
  use: number;
}

export interface TerraMysticaCultsResourceChange {
  type: "tm_cults";
  fire: number;
  water: number;
  earth: number;
  air: number;
}
