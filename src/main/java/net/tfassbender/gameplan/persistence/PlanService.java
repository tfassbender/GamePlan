package net.tfassbender.gameplan.persistence;

import net.tfassbender.gameplan.dto.PlanDto;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;

import java.util.List;

public interface PlanService {

  List<String> getPlanNames(String username) throws GamePlanPersistenceException;
  PlanDto getPlan(String username, String planName) throws GamePlanPersistenceException;
  PlanDto createPlan(String username, String gameName) throws GamePlanPersistenceException;
  PlanDto savePlan(String username, PlanDto plan) throws GamePlanPersistenceException;
  void deletePlan(String username, String planName) throws GamePlanPersistenceException;
}
