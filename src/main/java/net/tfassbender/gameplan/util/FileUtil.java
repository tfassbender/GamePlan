package net.tfassbender.gameplan.util;

import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceAlreadyExistingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileUtil {

  private static final Logger log = LoggerFactory.getLogger(FileUtil.class);

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
}
