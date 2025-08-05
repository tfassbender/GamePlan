package net.tfassbender.gameplan.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.gameplan.util.FileUtil;
import org.eclipse.microprofile.config.inject.ConfigProperty;
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
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public static final String USERS_SUB_DIR = "users";

    private static final String USER_CONFIG_FILE = ".user_config.json";

    @ConfigProperty(name = "game_plan.path")
    private String gamePlanPath;

    public List<String> getUsers() {
        Path usersDir = Paths.get(gamePlanPath, USERS_SUB_DIR);
        if (!Files.exists(usersDir)) {
            FileUtil.createDirectory(usersDir);
            return List.of();
        }

        try (Stream<Path> stream = Files.list(usersDir)) {
            return stream.filter(Files::isDirectory) //
                    .map(path -> path.getFileName().toString()) //
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Failed to list users directory: {}", usersDir, e);
            return List.of();
        }
    }

    public void createUser(String name) {
        Path userDir = Paths.get(gamePlanPath, USERS_SUB_DIR, name);
        if (!Files.exists(userDir)) {
            FileUtil.createDirectory(userDir);
        }
    }
}
