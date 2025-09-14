export interface PlanStageDto {
  description: string;
  resourceChanges: Record<string, number>;
}

export interface PlanDto {
  name: string;
  gameName: string;
  description: string;
  lastModified: string;
  resourceTypes: Record<string, ResourceType>;
  stages: PlanStageDto[];
}

export enum ResourceType {
  SIMPLE = "SIMPLE"
  // Add more types as needed
}
