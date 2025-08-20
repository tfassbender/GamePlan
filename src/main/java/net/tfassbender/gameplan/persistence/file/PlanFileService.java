package net.tfassbender.gameplan.persistence.file;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.gameplan.dto.PlanDto;
import net.tfassbender.gameplan.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.exception.GamePlanResourceNotFoundException;
import net.tfassbender.gameplan.persistence.PlanService;
import net.tfassbender.gameplan.util.FileUtil;
import org.apache.commons.lang3.tuple.Pair;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@ApplicationScoped
public class PlanFileService implements PlanService {

  private final Logger log = LoggerFactory.getLogger(PlanFileService.class);

  @ConfigProperty(name = "game_plan.path")
  private String gamePlanPath;

  public List<String> getPlanNames(String username) throws GamePlanPersistenceException {
    FileUtil.checkResourceNameValid(username);

    return getAllPlansForUser(username).map(dto -> dto.name).toList();
  }

  public PlanDto getPlan(String username, String planName) throws GamePlanPersistenceException {
    FileUtil.checkResourceNameValid(username);
    FileUtil.checkResourceNameValid(planName);

    return getAllPlansForUser(username).filter(dto -> planName.equals(dto.name)) //
            .findFirst() //
            .orElseThrow(() -> new GamePlanResourceNotFoundException("Plan '" + planName + "' does not exist for user '" + username + "'."));
  }

  public PlanDto createPlan(String username, String gameName) throws GamePlanPersistenceException {
    FileUtil.checkResourceNameValid(username);
    FileUtil.checkResourceNameValid(gameName);

    Path planFilePath = createPlanFile(username, gameName);

    PlanDto newPlan = new PlanDto();
    newPlan.name = getUniquePlanName(username, gameName);
    newPlan.gameName = gameName;
    newPlan.lastModified = getCurrentTimestampAsString();

    ObjectMapper mapper = new ObjectMapper();
    try {
      String content = mapper.writeValueAsString(newPlan);
      log.info("Creating new plan file '{}' for user '{}'", planFilePath.getFileName(), username);
      Files.writeString(planFilePath, content);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to create plan file: " + gameName, e);
    }

    return newPlan;
  }

  private Path createPlanFile(String username, String gameName) throws GamePlanResourceNotFoundException {
    return getUserDirPath(username).resolve(gameName + "_" + getCurrentTimestampForFileName() + ".json");
  }

  private String getUniquePlanName(String username, String gameName) throws GamePlanPersistenceException {
    List<String> existingPlanNames = getAllPlansForUser(username).map(dto -> dto.name).toList();
    if (existingPlanNames.isEmpty()) {
      return gameName;
    }

    String candidate = gameName;
    int counter = 1;
    while (existingPlanNames.contains(candidate)) {
      candidate = gameName + "_" + counter;
      counter++;
    }
    return candidate;
  }

  public PlanDto savePlan(String username, PlanDto plan) throws GamePlanPersistenceException {
    FileUtil.checkResourceNameValid(username);
    if (plan == null) {
      throw new GamePlanPersistenceException("PlanDto cannot be null.");
    }
    FileUtil.checkResourceNameValid(plan.name);

    Path planFilePath = findPlanDtoAndPathByName(username, plan.name).getRight();
    ObjectMapper mapper = new ObjectMapper();
    try {
      plan.lastModified = getCurrentTimestampAsString();
      String content = mapper.writeValueAsString(plan);
      log.debug("Saving plan '{}' for user '{}' - filename '{}'", plan.name, username, planFilePath.getFileName().toString());
      Files.writeString(planFilePath, content);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to save plan file: " + plan.name, e);
    }

    return plan;
  }

  public void deletePlan(String username, String planName) throws GamePlanPersistenceException {
    FileUtil.checkResourceNameValid(username);
    FileUtil.checkResourceNameValid(planName);
    
    Pair<PlanDto, Path> plan = findPlanDtoAndPathByName(username, planName);

    try {
      log.info("Deleting plan '{}' for user '{}' - filename '{}'", planName, username, plan.getRight().getFileName().toString());
      Files.delete(plan.getRight());
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to delete plan file: " + planName, e);
    }
  }

  private Pair<PlanDto, Path> findPlanDtoAndPathByName(String username, String planName) throws GamePlanPersistenceException {
    Path userDir = Paths.get(gamePlanPath, UserFileService.USERS_SUB_DIR, username);
    if (!Files.exists(userDir) || !Files.isDirectory(userDir)) {
      throw new GamePlanResourceNotFoundException("User directory does not exist for user '" + username + "'.");
    }

    try (Stream<Path> files = Files.list(userDir)) {
      return files.filter(Files::isRegularFile) //
              .filter(path -> path.toString().endsWith(".json")) //
              .map(path -> {
                String fileName = path.getFileName().toString();
                log.info("Checking plan file '{}' for user '{}'", fileName, username);
                try {
                  PlanDto planDto = loadPlanFile(username, fileName);
                  return Pair.of(planDto, path);
                }
                catch (GamePlanPersistenceException e) {
                  log.error("Failed to load plan file '{}' for user '{}': {}", fileName, username, e.getMessage(), e);
                  return null;
                }
              }) //
              .filter(Objects::nonNull) //
              .filter(pair -> planName.equals(pair.getLeft().name)) //
              .findFirst() //
              .orElseThrow(() -> new GamePlanResourceNotFoundException("Plan '" + planName + "' does not exist for user '" + username + "'."));
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to list plan files for user '" + userDir.getFileName().toString() + "'.", e);
    }
  }

  private Stream<PlanDto> getAllPlansForUser(String username) throws GamePlanPersistenceException {
    Path usersDir = Paths.get(gamePlanPath, UserFileService.USERS_SUB_DIR, username);
    if (!Files.exists(usersDir) || !Files.isDirectory(usersDir)) {
      throw new GamePlanResourceNotFoundException("User directory does not exist for user '" + username + "'.");
    }

    return getPlanFileNames(usersDir) //
            .map(planFile -> {
              try {
                return loadPlanFile(username, planFile);
              }
              catch (GamePlanPersistenceException e) {
                log.error("Failed to load plan file '{}' for user '{}': {}", planFile, username, e.getMessage(), e);
                return null;
              }
            }) //
            .filter(Objects::nonNull);
  }

  private Stream<String> getPlanFileNames(Path userDir) throws GamePlanPersistenceException {
    try (Stream<Path> files = Files.list(userDir)) {
      List<String> fileNames = files.filter(Files::isRegularFile) //
              .filter(path -> path.toString().endsWith(".json")) //
              .map(path -> path.getFileName().toString()) //
              .toList();

      // return a new stream, since the files stream is auto-closed by the try-with-resources block
      return fileNames.stream();
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to list plan files for user '" + userDir.getFileName().toString() + "'.", e);
    }
  }

  private PlanDto loadPlanFile(String username, String planFile) throws GamePlanPersistenceException {
    Path planFilePath = Paths.get(gamePlanPath, UserFileService.USERS_SUB_DIR, username, planFile);
    if (!Files.exists(planFilePath)) {
      throw new GamePlanResourceNotFoundException("A plan with the file name '" + planFile + "' does not exist for user '" + username + "'.");
    }

    try {
      String content = Files.readString(planFilePath);
      ObjectMapper mapper = new ObjectMapper();
      return mapper.readValue(content, PlanDto.class);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to read plan file: " + planFile, e);
    }
  }

  private Path getUserDirPath(String username) throws GamePlanResourceNotFoundException {
    Path userDir = Paths.get(gamePlanPath, UserFileService.USERS_SUB_DIR, username);
    if (!Files.exists(userDir)) {
      throw new GamePlanResourceNotFoundException("User directory does not exist for user '" + username + "'.");
    }
    return userDir;
  }

  private String getCurrentTimestampAsString() {
    return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(new Date());
  }

  private String getCurrentTimestampForFileName() {
    return new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
  }
}
