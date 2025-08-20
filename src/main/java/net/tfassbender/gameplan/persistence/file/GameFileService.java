package net.tfassbender.gameplan.persistence.file;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.gameplan.dto.GameDto;
import net.tfassbender.gameplan.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.exception.GamePlanResourceNotFoundException;
import net.tfassbender.gameplan.persistence.GameService;
import net.tfassbender.gameplan.util.FileUtil;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;

@ApplicationScoped
public class GameFileService implements GameService {

  public static final String GAMES_SUB_DIR = "games";
  public static final String GAME_CONFIG_FILE_EXTENSION = ".json";

  @ConfigProperty(name = "game_plan.path")
  private String gamePlanPath;

  public List<String> getGameNames() throws GamePlanPersistenceException {
    Path gamesDir = Paths.get(gamePlanPath, GAMES_SUB_DIR);
    if (!Files.exists(gamesDir)) {
      throw new GamePlanResourceNotFoundException("The games directory does not exist: " + gamesDir);
    }

    try (Stream<Path> files = Files.list(gamesDir)) {
      return files.filter(Files::isRegularFile) //
              .filter(path -> path.toString().endsWith(GAME_CONFIG_FILE_EXTENSION)) //
              .map(path -> path.getFileName().toString()) //
              .map(fileName -> fileName.substring(0, fileName.length() - GAME_CONFIG_FILE_EXTENSION.length())) // Remove file extension
              .toList();
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to list game files in directory: " + gamesDir, e);
    }
  }

  public GameDto getGame(String gameName) throws GamePlanPersistenceException {
    FileUtil.checkResourceNameValid(gameName);

    Path gameFilePath = Paths.get(gamePlanPath, GAMES_SUB_DIR, gameName + GAME_CONFIG_FILE_EXTENSION);
    if (!Files.exists(gameFilePath)) {
      throw new GamePlanResourceNotFoundException("A config for a game with the name '" + gameName + "' does not exist.");
    }

    try {
      String content = Files.readString(gameFilePath);
      return parseGameConfig(gameName, content);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to read game config file: " + gameName + GAME_CONFIG_FILE_EXTENSION, e);
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