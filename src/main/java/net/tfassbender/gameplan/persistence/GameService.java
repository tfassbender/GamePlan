package net.tfassbender.gameplan.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.gameplan.dto.GameDto;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceNotFoundException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;

@ApplicationScoped
public class GameService {

  public static final String GAMES_SUB_DIR = "games";

  @ConfigProperty(name = "game_plan.path")
  private String gamePlanPath;

  public List<String> getGameNames() throws GamePlanPersistenceException {
    Path gamesDir = Paths.get(gamePlanPath, GAMES_SUB_DIR);
    if (!Files.exists(gamesDir)) {
      throw new GamePlanResourceNotFoundException("The games directory does not exist: " + gamesDir);
    }

    try (Stream<Path> files = Files.list(gamesDir)) {
      return files.filter(Files::isRegularFile) //
              .filter(path -> path.toString().endsWith(".json")) //
              .map(path -> path.getFileName().toString()) //
              .toList();
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to list game files in directory: " + gamesDir, e);
    }
  }

  public GameDto getGame(String gameName) throws GamePlanPersistenceException {
    Path gameFilePath = Paths.get(gamePlanPath, GAMES_SUB_DIR, gameName);
    if (!Files.exists(gameFilePath)) {
      throw new GamePlanResourceNotFoundException("A config for a game with the name '" + gameName + "' does not exist.");
    }

    try {
      String content = Files.readString(gameFilePath);
      return parseGameConfig(gameName, content);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to read game config file: " + gameName, e);
    }
  }

  private GameDto parseGameConfig(String gameName, String content) throws GamePlanPersistenceException {
    try {
      ObjectMapper mapper = new ObjectMapper();
      return mapper.readValue(content, GameDto.class);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to parse game config for: " + gameName, e);
    }
  }
}
