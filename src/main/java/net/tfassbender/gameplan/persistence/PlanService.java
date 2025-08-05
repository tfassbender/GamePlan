package net.tfassbender.gameplan.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.gameplan.dto.PlanDto;
import net.tfassbender.gameplan.util.FileUtil;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@ApplicationScoped
public class PlanService {
    private static final Logger log = LoggerFactory.getLogger(PlanService.class.getName());

    @ConfigProperty(name = "game_plan.path")
    private String gamePlanPath;

    public List<String> getPlanFiles(String username) {
        Path userDir = Paths.get(gamePlanPath, UserService.USERS_SUB_DIR, username);
        if (!Files.exists(userDir)) {
            log.info("User directory does not exist for user '{}'.", username);
            FileUtil.createDirectory(userDir);
            return List.of();
        }

        try (Stream<Path> files = Files.list(userDir)) {
            return files.filter(Files::isRegularFile) //
                    .filter(path -> path.toString().endsWith(".json")) //
                    .map(path -> path.getFileName().toString()) //
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Error reading plan files for user '{}' from directory: {}", username, userDir, e);
            return List.of();
        }
    }

    public PlanDto getPlan(String username, String plan) throws GamePlanPersistenceException {
        Path planFilePath = Paths.get(gamePlanPath, UserService.USERS_SUB_DIR, username, plan);
        if (!Files.exists(planFilePath)) {
            throw new GamePlanPersistenceException("A plan with the name '" + plan + "' does not exist for user '" + username + "'.");
        }

        try {
            String content = Files.readString(planFilePath);
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(content, PlanDto.class);
        } catch (IOException e) {
            throw new GamePlanPersistenceException("Failed to read plan file: " + plan, e);
        }
    }

    public void savePlan(String username, PlanDto plan) throws GamePlanPersistenceException {
        Path userDir = Paths.get(gamePlanPath, UserService.USERS_SUB_DIR, username);
        if (!Files.exists(userDir)) {
            throw new GamePlanPersistenceException("User directory does not exist for user '" + username + "'.");
        }

        Path planFilePath = userDir.resolve(plan.name + ".json");
        ObjectMapper mapper = new ObjectMapper();
        try {
            String content = mapper.writeValueAsString(plan);
            Files.writeString(planFilePath, content);
        } catch (IOException e) {
            throw new GamePlanPersistenceException("Failed to save plan file: " + plan.name, e);
        }
    }

    public void deletePlan(String username, String planName) throws GamePlanPersistenceException {
        Path planFilePath = Paths.get(gamePlanPath, UserService.USERS_SUB_DIR, username, planName + ".json");
        if (!Files.exists(planFilePath)) {
            throw new GamePlanPersistenceException("A plan with the name '" + planName + "' does not exist for user '" + username + "'.");
        }

        try {
            Files.delete(planFilePath);
        } catch (IOException e) {
            throw new GamePlanPersistenceException("Failed to delete plan file: " + planName, e);
        }
    }
}

