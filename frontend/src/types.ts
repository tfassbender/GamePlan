export interface PlanStageDto {
  description: string;
  resourceChanges: Record<string, number>;
}

export interface PlanDto {
  name: string;
  gameName: string;
  description: string;
  lastModified: string;
  stages: PlanStageDto[];
}
