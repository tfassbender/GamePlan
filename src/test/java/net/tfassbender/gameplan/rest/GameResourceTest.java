package net.tfassbender.gameplan.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import net.tfassbender.gameplan.dto.GameDto;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasItem;

@QuarkusTest
public class GameResourceTest {

  private static final Logger log = LoggerFactory.getLogger(GameResourceTest.class);

  private static final Path GAMES_DIR = Paths.get("build/test-gameplan-data/.games");

  @Test
  public void testGetGames_returnsEmptyList() {
    var response = RestAssured.given() //
            .header("Accept", "application/json") //
            .when().get("/games") //
            .then().extract();

    int statusCode = response.statusCode();
    String body = response.body().asString();
    log.info("Status code: {}", statusCode);
    log.info("Response body: {}", body);
    assertThat(statusCode, is(200));
    List<?> games = response.body().as(List.class);
    log.info("Response from /games endpoint: {}", games);
  }

  @Test
  public void testGetGames_returnsGameNameAfterAddingFile() throws Exception {
    // Setup: create a game config file
    String testGameName = "TestGame1";
    Path gamesDir = GAMES_DIR;
    Files.createDirectories(gamesDir);
    Path testGameFile = gamesDir.resolve(testGameName + ".json");
    String minimalGameDtoJson = "{\"name\":\"TestGame1\"}";
    Files.writeString(testGameFile, minimalGameDtoJson);

    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().get("/games") //
              .then().statusCode(200) //
              .extract();
      List<String> games = response.body().as(List.class);
      assertThat(games, hasItem(testGameName));
    }
    finally {
      // Cleanup: delete the test file
      Files.deleteIfExists(testGameFile);
    }
  }

  @Test
  public void testGetGameDetails_returnsGameDto() throws Exception {
    // Setup: create a game config file
    String testGameName = "TestGame2";
    Path gamesDir = GAMES_DIR;
    Files.createDirectories(gamesDir);
    Path testGameFile = gamesDir.resolve(testGameName + ".json");
    String minimalGameDtoJson = """
            {
              "name":"TestGame2",
              "description":"A test game",
              "resources":{"gold":"SIMPLE"},
              "defaultStartingResources":{
                "description":"Start",
                "resourceChanges":{"gold":100}
              }
            }
            """;
    Files.writeString(testGameFile, minimalGameDtoJson);

    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().get("/games/" + testGameName) //
              .then().statusCode(200) //
              .extract();
      GameDto gameDto = response.body().as(GameDto.class);
      assertThat(gameDto.name, is("TestGame2"));
      assertThat(gameDto.description, is("A test game"));
      assertThat(gameDto.resources.containsKey("gold"), is(true));
      assertThat(gameDto.resources.get("gold").toString(), is("SIMPLE"));
      assertThat(gameDto.defaultStartingResources.description, is("Start"));
      assertThat(gameDto.defaultStartingResources.resourceChanges.get("gold"), is(100));
    }
    finally {
      // Cleanup: delete the test file
      Files.deleteIfExists(testGameFile);
    }
  }

  @Test
  public void testGetGameDetails_invalidName() throws Exception {
    String invalidGameName = "../../../invalid/game/name";
    String encodedGameName = java.net.URLEncoder.encode(invalidGameName, java.nio.charset.StandardCharsets.UTF_8);
    var response = RestAssured.given() //
            .header("Accept", "application/json") //
            .when().get("/games/" + encodedGameName) //
            .then().extract();
    int statusCode = response.statusCode();
    String body = response.body().asString();
    log.info("GET /games/{} response status: {} body: {}", encodedGameName, statusCode, body);
    // Expecting 400 Bad Request
    assertThat(statusCode, is(400));
    assertThat(body, org.hamcrest.Matchers.containsString("Invalid game name"));
    assertThat(body, org.hamcrest.Matchers.containsString(invalidGameName));
    assertThat(body, org.hamcrest.Matchers.containsString("only alphanumeric characters or underscores"));
  }
}
