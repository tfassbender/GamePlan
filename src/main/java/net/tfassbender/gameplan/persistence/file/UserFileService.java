package net.tfassbender.gameplan.persistence.file;

import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.gameplan.persistence.UserService;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceAlreadyExistingException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceNotFoundException;
import net.tfassbender.gameplan.util.FileUtil;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@ApplicationScoped
public class UserFileService implements UserService {

  public static final String USERS_SUB_DIR = ".users";

  @ConfigProperty(name = "game_plan.path")
  private String gamePlanPath;

  public List<String> getUsers() throws GamePlanPersistenceException {
    Path usersDir = Paths.get(gamePlanPath, USERS_SUB_DIR);
    if (!Files.exists(usersDir)) {
      throw new GamePlanResourceNotFoundException("The users directory does not exist: " + usersDir);
    }

    try (Stream<Path> stream = Files.list(usersDir)) {
      return stream.filter(Files::isDirectory) //
              .map(path -> path.getFileName().toString()) //
              .collect(Collectors.toList());
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to list users in directory: " + usersDir, e);
    }
  }

  public void createUser(String name) throws GamePlanPersistenceException {
    Path userDir = Paths.get(gamePlanPath, USERS_SUB_DIR, name);
    if (Files.exists(userDir)) {
      throw new GamePlanResourceAlreadyExistingException("User '" + name + "' already exists.");
    }

    FileUtil.createDirectory(userDir);
  }
}


