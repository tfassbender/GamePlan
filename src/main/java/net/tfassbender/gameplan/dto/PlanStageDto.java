package net.tfassbender.gameplan.dto;

import java.util.HashMap;
import java.util.Map;

public class PlanStageDto {

  public String description;
  public Map<String, Integer> resourceChanges = new HashMap<>();
}
