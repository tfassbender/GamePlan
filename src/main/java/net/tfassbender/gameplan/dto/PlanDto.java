package net.tfassbender.gameplan.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PlanDto {

  public String name;
  public String gameName;
  public String description;
  public String lastModified;
  public Map<String, ResourceType> resourceTypes = new HashMap<>();
  public List<PlanStageDto> stages = new ArrayList<>();
}
