package net.tfassbender.gameplan.util;

import net.tfassbender.gameplan.exception.GamePlanInvalidResourceNameException;
import net.tfassbender.gameplan.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.exception.GamePlanResourceAlreadyExistingException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileUtil {

  private FileUtil() {}

  public static void createDirectoryIfNotExists(Path dir) throws GamePlanPersistenceException {
    if (!Files.exists(dir)) {
      try {
        Files.createDirectories(dir);
      }
      catch (IOException e) {
        throw new GamePlanPersistenceException("Failed to create directory: " + dir, e);
      }
    }
  }

  public static void createDirectory(Path dir) throws GamePlanPersistenceException {
    if (Files.exists(dir)) {
      throw new GamePlanResourceAlreadyExistingException("The directory '" + dir + "' already exists.");
    }

    try {
      Files.createDirectories(dir);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to create directory: " + dir, e);
    }
  }

  /**
   * Checks whether a resource name is not null or empty and consists of only alphanumeric characters or underscores.
   * @param resourceName the name of the resource to check
   */
  public static void checkResourceNameValid(String resourceName) throws GamePlanInvalidResourceNameException {
    if (resourceName == null || resourceName.isEmpty()) {
      throw new GamePlanInvalidResourceNameException("Resource name must not be null or empty.");
    }
    if (!resourceName.matches("[a-zA-Z0-9_]+")) {
      throw new GamePlanInvalidResourceNameException("Resource name must consist of only alphanumeric characters or underscores (was '" + resourceName + "').");
    }
  }
}
