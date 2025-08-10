package net.tfassbender.gameplan.dto;

import java.util.ArrayList;
import java.util.List;

public class PlanDto {

  public String name;
  public String gameName;
  public String filename;
  public String description;
  public String lastModified;
  public List<PlanStageDto> stages = new ArrayList<>();
}
