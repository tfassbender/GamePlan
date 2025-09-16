package net.tfassbender.gameplan.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GameDto {

  public String name;
  public String description;

  public List<String> resourceOrder = new ArrayList<>();
  public Map<String, ResourceType> resources = new HashMap<>();
  public PlanStageDto defaultStartingResources = new PlanStageDto();
}
