package net.tfassbender.gameplan.dto;

import java.util.HashMap;
import java.util.Map;

public class GameDto {

  public String name;
  public String description;

  public Map<String, ResourceType> resources = new HashMap<>();
  public PlanStageDto defaultStartingResources = new PlanStageDto();
}
