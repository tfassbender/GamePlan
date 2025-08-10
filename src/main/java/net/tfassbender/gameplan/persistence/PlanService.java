package net.tfassbender.gameplan.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import net.tfassbender.gameplan.dto.PlanDto;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceNotFoundException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@ApplicationScoped
public class PlanService {

  private final Logger log = LoggerFactory.getLogger(PlanService.class);

  @ConfigProperty(name = "game_plan.path")
  private String gamePlanPath;

  @Inject
  private UserService userService;

  private final Map<String, Map<String, Path>> usersToPlansToFiles = new HashMap<>();

  @PostConstruct
  protected void loadGamePlanFileMappings() {
    Path usersDir = Paths.get(gamePlanPath, UserService.USERS_SUB_DIR);
    if (Files.exists(usersDir) && Files.isDirectory(usersDir)) {
      try (Stream<Path> userDirs = Files.list(usersDir)) {
        userDirs.filter(Files::isDirectory) //
                .filter(file -> !file.getFileName().toString().equals(UserService.USERS_SUB_DIR)) // filter out the ".users" system directory
                .forEach(userDir -> {
                  String username = userDir.getFileName().toString();
                  try {
                    List<String> planFiles = getPlanFiles(userDir);
                    for (String planFile : planFiles) {
                      Path planFilePath = userDir.resolve(planFile);
                      PlanDto planDto = loadPlanFile(username, planFile);
                      usersToPlansToFiles.computeIfAbsent(username, k -> new HashMap<>()).put(planDto.name, planFilePath);
                    }
                  }
                  catch (GamePlanPersistenceException e) {
                    log.error("Failed to load plans for user '{}': {}", username, e.getMessage(), e);
                  }
                });
      }
      catch (IOException e) {
        log.error("Failed to list user directories in game plan path: {}", gamePlanPath, e);
      }
    }
  }

  private List<String> getPlanFiles(Path userDir) throws GamePlanPersistenceException {
    try (Stream<Path> files = Files.list(userDir)) {
      return files.filter(Files::isRegularFile) //
              .filter(path -> path.toString().endsWith(".json")) //
              .map(path -> path.getFileName().toString()) //
              .collect(Collectors.toList());
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to list plan files for user '" + userDir.getFileName().toString() + "'.", e);
    }
  }

  private PlanDto loadPlanFile(String username, String planFile) throws GamePlanPersistenceException {
    Path planFilePath = Paths.get(gamePlanPath, UserService.USERS_SUB_DIR, username, planFile);
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

  public List<String> getPlanNames(String username) throws GamePlanPersistenceException {
    Map<String, Path> plansToFiles = usersToPlansToFiles.get(username);
    if (plansToFiles == null) {
      throw new GamePlanResourceNotFoundException("No plans found for user '" + username + "'.");
    }

    return plansToFiles.keySet().stream().toList();
  }

  public PlanDto getPlan(String username, String planName) throws GamePlanPersistenceException {
    Map<String, Path> plansToFiles = usersToPlansToFiles.get(username);
    if (plansToFiles == null || !plansToFiles.containsKey(planName)) {
      throw new GamePlanResourceNotFoundException("Plan '" + planName + "' does not exist for user '" + username + "'.");
    }

    Path planFilePath = plansToFiles.get(planName);
    try {
      String content = Files.readString(planFilePath);
      ObjectMapper mapper = new ObjectMapper();
      return mapper.readValue(content, PlanDto.class);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to read plan file: " + planName, e);
    }
  }

  public PlanDto createPlan(String username, String gameName) throws GamePlanPersistenceException {
    Path planFilePath = createPlanFile(username, gameName);

    PlanDto newPlan = new PlanDto();
    newPlan.name = getUniquePlanName(username, gameName);
    newPlan.filename = planFilePath.getFileName().toString();
    newPlan.gameName = gameName;
    newPlan.lastModified = getCurrentTimestampAsString();

    ObjectMapper mapper = new ObjectMapper();
    try {
      String content = mapper.writeValueAsString(newPlan);
      Files.writeString(planFilePath, content);

      usersToPlansToFiles.get(username).put(newPlan.name, planFilePath);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to create plan file: " + gameName, e);
    }

    return newPlan;
  }

  private Path createPlanFile(String username, String gameName) throws GamePlanResourceNotFoundException {
    return getUserDirPath(username).resolve(gameName + "_" + getCurrentTimestampForFileName() + ".json");
  }

  private String getUniquePlanName(String username, String gameName) {
    Map<String, Path> plans = usersToPlansToFiles.get(username);
    if (plans == null) {
      return gameName;
    }
    String candidate = gameName;
    int counter = 1;
    while (plans.containsKey(candidate)) {
      candidate = gameName + "_" + counter;
      counter++;
    }
    return candidate;
  }

  public PlanDto savePlan(String username, PlanDto plan) throws GamePlanPersistenceException {
    Path userDir = getUserDirPath(username);

    Path planFilePath = userDir.resolve(plan.filename);
    ObjectMapper mapper = new ObjectMapper();
    try {
      plan.lastModified = getCurrentTimestampAsString();
      String content = mapper.writeValueAsString(plan);
      Files.writeString(planFilePath, content);

      // Update the in-memory mapping
      usersToPlansToFiles.computeIfAbsent(username, k -> new HashMap<>()).put(plan.name, planFilePath);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to save plan file: " + plan.name, e);
    }

    return plan;
  }

  public void deletePlan(String username, String planName) throws GamePlanPersistenceException {
    Map<String, Path> plansToFiles = usersToPlansToFiles.get(username);
    if (plansToFiles == null || !plansToFiles.containsKey(planName)) {
      throw new GamePlanResourceNotFoundException("Plan '" + planName + "' does not exist for user '" + username + "'.");
    }

    Path planFilePath = getUserDirPath(username).resolve(plansToFiles.get(planName).getFileName());

    try {
      Files.delete(planFilePath);
    }
    catch (IOException e) {
      throw new GamePlanPersistenceException("Failed to delete plan file: " + planName, e);
    }
  }

  private Path getUserDirPath(String username) throws GamePlanResourceNotFoundException {
    Path userDir = Paths.get(gamePlanPath, UserService.USERS_SUB_DIR, username);
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
