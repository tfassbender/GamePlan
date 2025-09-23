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
  SIMPLE_COMBINED = "SIMPLE_COMBINED",
  ABSOLUTE = "ABSOLUTE",
  TERRA_MYSTICA_POWER = "TERRA_MYSTICA_POWER",
  TERRA_MYSTICA_CULTS = "TERRA_MYSTICA_CULTS"
  // Add more types as needed
}

export type ResourceChangeValue = SimpleResourceChange | PowerResourceChange | TerraMysticaCultsResourceChange | SimpleCombinedResourceChange | AbsoluteResourceChange;

export interface SimpleResourceChange {
  type: "simple";
  value: number;
}

export interface PowerResourceChange {
  type: "terra_mystica_power";
  bowl1: number;
  bowl2: number;
  bowl3: number;
  gain: number;
  burn: number;
  use: number;
}

export interface TerraMysticaCultsResourceChange {
  type: "terra_mystica_cults";
  fire: number;
  water: number;
  earth: number;
  air: number;
}

export interface SimpleCombinedResourceChange {
  type: "simple_combined";
  resources: Record<string, number>;
  colors: Record<string, string>;
}

export interface AbsoluteResourceChange {
  type: "absolute";
  value: number | null;
}
