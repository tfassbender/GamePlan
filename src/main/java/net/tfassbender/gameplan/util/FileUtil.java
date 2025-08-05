package net.tfassbender.gameplan.util;

import net.tfassbender.gameplan.persistence.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileUtil {

    private static final Logger log = LoggerFactory.getLogger(FileUtil.class);

    public static void createDirectory(Path dir) {
        if (Files.exists(dir)) {
            log.debug("Directory already exists: {}", dir);
            return;
        }

        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            log.error("Failed to create directory: {}", dir, e);
        }
    }
}
