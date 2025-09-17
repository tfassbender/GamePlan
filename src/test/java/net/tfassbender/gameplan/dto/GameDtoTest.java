package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Tests the loading of GameDto configurations.
 */
public class GameDtoTest {

  @Test
  void testLoadTestGameJson() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    File file = Paths.get("examples/game_configs/test_game.json").toFile();
    GameDto dto = mapper.readValue(file, GameDto.class);
    assertNotNull(dto, "GameDto should not be null");
  }

  @Test
  void testLoadTerraMysticaJson() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    File file = Paths.get("examples/game_configs/TerraMystica.json").toFile();
    GameDto dto = mapper.readValue(file, GameDto.class);
    assertNotNull(dto, "GameDto should not be null");
  }
}
