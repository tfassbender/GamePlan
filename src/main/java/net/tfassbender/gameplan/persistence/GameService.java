package net.tfassbender.gameplan.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.gameplan.dto.GameDto;
import net.tfassbender.gameplan.util.FileUtil;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;

@ApplicationScoped
public class GameService {
    private static final Logger log = LoggerFactory.getLogger(GameService.class.getName());

    public static final String GAMES_SUB_DIR = "games";

    @ConfigProperty(name = "game_plan.path")
    private String gamePlanPath;

    public List<String> getGameNames() {
        Path gamesDir = Paths.get(gamePlanPath, GAMES_SUB_DIR);
        if (!Files.exists(gamesDir)) {
            log.info("Games directory does not exist: {} - an empty directory will be created.", gamesDir);
            FileUtil.createDirectory(gamesDir);
            return List.of();
        }

        try (Stream<Path> files = Files.list(gamesDir)) {
            return files.filter(Files::isRegularFile) //
                    .filter(path -> path.toString().endsWith(".json")) //
                    .map(path -> path.getFileName().toString()) //
                    .toList();
        } catch (IOException e) {
            log.error("Error reading game files from directory: {}", gamesDir, e);
            return List.of();
        }
    }

    public GameDto getGame(String gameName) throws GamePlanPersistenceException {
        Path gameFilePath = Paths.get(gamePlanPath, GAMES_SUB_DIR, gameName);
        if (!Files.exists(gameFilePath)) {
            throw new GamePlanPersistenceException("A config for a game with the name '" + gameName + "' does not exist.");
        }

        try {
            String content = Files.readString(gameFilePath);
            return parseGameConfig(gameName, content);
        } catch (IOException e) {
            throw new GamePlanPersistenceException("Failed to read game config file: " + gameName, e);
        }
    }

    private GameDto parseGameConfig(String gameName, String content) throws GamePlanPersistenceException {
        try {
            // Assuming you use Jackson for JSON parsing
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(content, GameDto.class);
        } catch (IOException e) {
            throw new GamePlanPersistenceException("Failed to parse game config for: " + gameName, e);
        }
    }
}
