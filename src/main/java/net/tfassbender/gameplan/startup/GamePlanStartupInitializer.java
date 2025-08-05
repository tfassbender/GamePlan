package net.tfassbender.gameplan.startup;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import net.tfassbender.gameplan.persistence.GameService;
import net.tfassbender.gameplan.persistence.UserService;
import net.tfassbender.gameplan.util.FileUtil;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Path;

@ApplicationScoped
public class GamePlanStartupInitializer {

    private static final Logger log = LoggerFactory.getLogger(GamePlanStartupInitializer.class);

    @ConfigProperty(name = "game_plan.path")
    private String gamePlanPath;

    @Inject
    private GameService gameService;

    void onStartup(@Observes StartupEvent startupEvent) {
        log.info("GamePlan application is starting up...");

        if (gamePlanPath == null || gamePlanPath.isBlank()) {
            log.error("The game plan path is not configured. Please set 'game_plan.path' in your application.properties file.");
            return;
        }

        log.info("Game plan path: {}", gamePlanPath);

        Path gamePlanDir = Path.of(gamePlanPath);
        FileUtil.createDirectory(gamePlanDir);
        Path gamesDir = gamePlanDir.resolve(GameService.GAMES_SUB_DIR);
        FileUtil.createDirectory(gamesDir);
        Path usersDir = gamePlanDir.resolve(UserService.USERS_SUB_DIR);
        FileUtil.createDirectory(usersDir);

        log.info("GamePlan application startup completed successfully.");
    }
}
