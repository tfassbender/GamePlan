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
  TM_POWER = "TM_POWER"
  // Add more types as needed
}

export type ResourceChangeValue = SimpleResourceChange | PowerResourceChange;

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
