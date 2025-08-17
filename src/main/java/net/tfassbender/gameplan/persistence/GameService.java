package net.tfassbender.gameplan.persistence;

import net.tfassbender.gameplan.dto.GameDto;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;

import java.util.List;

public interface GameService {

  List<String> getGameNames() throws GamePlanPersistenceException;
  GameDto getGame(String gameName) throws GamePlanPersistenceException;
}
