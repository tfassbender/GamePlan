package net.tfassbender.gameplan.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import net.tfassbender.gameplan.dto.PlanCloneDto;
import net.tfassbender.gameplan.dto.PlanDto;
import net.tfassbender.gameplan.dto.SimpleResourceChange;
import net.tfassbender.gameplan.dto.TerraMysticaPowerResourceChange;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PlanResourceTest {

  private static final String TEST_USER = "TestUser1";
  private static final Path USER_DIR = Paths.get("build/test-gameplan-data/.users/" + TEST_USER);
  private static final Path GAMES_DIR = Paths.get("build/test-gameplan-data/.games");
  private static final Path PLAN_FILE = USER_DIR.resolve("TestPlan1.json");

  @BeforeAll
  void setupUser() throws Exception {
    Files.createDirectories(USER_DIR);
  }

  @AfterAll
  void cleanupUser() throws Exception {
    if (Files.exists(PLAN_FILE)) {
      Files.delete(PLAN_FILE);
    }
    if (Files.exists(USER_DIR)) {
      Files.delete(USER_DIR);
    }
  }

  @Test
  public void testGetPlans_returnsEmptyList() {
    var response = RestAssured.given() //
            .header("Accept", "application/json") //
            .when().get("/users/" + TEST_USER + "/plans") //
            .then().statusCode(200) //
            .extract();
    List<?> plans = response.body().as(List.class);
    assertThat(plans, is(empty()));
  }

  @Test
  public void testGetPlans_returnsPlanNameAfterAddingFile() throws Exception {
    String minimalPlanJson = "{\"name\":\"TestPlan1\",\"gameName\":\"TestGame1\"}";
    Files.writeString(PLAN_FILE, minimalPlanJson);
    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().get("/users/" + TEST_USER + "/plans") //
              .then().statusCode(200) //
              .extract();
      List<String> plans = response.body().jsonPath().getList("", String.class);
      assertThat(plans, hasItem("TestPlan1"));
    }
    finally {
      Files.deleteIfExists(PLAN_FILE);
    }
  }

  @Test
  public void testGetPlans_invalidUserName() {
    String invalidUserName = "../../../path/to/invalid/plan";
    String encodedPlanName = URLEncoder.encode(invalidUserName, StandardCharsets.UTF_8);
    var response = RestAssured.given() //
            .header("Accept", "application/json") //
            .when().get("/users/" + encodedPlanName + "/plans") //
            .then().extract();
    int statusCode = response.statusCode();
    String body = response.body().asString();
    // Expecting 400 Bad Request
    assertThat(statusCode, is(400));
    assertThat(body, containsString("Invalid user name"));
    assertThat(body, containsString(invalidUserName));
    assertThat(body, containsString("only alphanumeric characters or underscores"));
  }

  @Test
  public void testGetPlan_returnsPlanDto() throws Exception {
    String planName = "TestPlan2";
    Path planFile = USER_DIR.resolve(planName + ".json");
    String planJson = """
            {
              "name": "TestPlan2",
              "gameName": "TestGame1",
              "description": "A test plan",
              "stages": [
                {
                  "description": "Stage 1",
                  "resourceChanges": {"gold": {"type": "simple", "value": 10}, "wood": {"type": "simple", "value": 5}}
                },
                {
                  "description": "Stage 2",
                  "resourceChanges": {"gold": {"type": "simple", "value": 20}, "wood": {"type": "simple", "value": 0}}
                }
              ]
            }
            """;
    Files.writeString(planFile, planJson);
    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().get("/users/" + TEST_USER + "/plans/" + planName) //
              .then().statusCode(200).extract();
      PlanDto planDto = response.body().as(PlanDto.class);
      assertThat(planDto.name, is(planName));
      assertThat(planDto.gameName, is("TestGame1"));
      assertThat(planDto.description, is("A test plan"));
      assertThat(planDto.stages, hasSize(2));
      assertThat(planDto.stages.get(0).description, is("Stage 1"));
      assertThat(planDto.stages.get(0).resourceChanges.get("gold"), instanceOf(SimpleResourceChange.class));
      assertThat(((SimpleResourceChange) planDto.stages.get(0).resourceChanges.get("gold")).value(), is(10));
      assertThat(planDto.stages.get(0).resourceChanges.get("wood"), instanceOf(SimpleResourceChange.class));
      assertThat(((SimpleResourceChange) planDto.stages.get(0).resourceChanges.get("wood")).value(), is(5));
      assertThat(planDto.stages.get(1).resourceChanges.get("gold"), instanceOf(SimpleResourceChange.class));
      assertThat(((SimpleResourceChange) planDto.stages.get(1).resourceChanges.get("gold")).value(), is(20));
      assertThat(planDto.stages.get(1).resourceChanges.get("wood"), instanceOf(SimpleResourceChange.class));
      assertThat(((SimpleResourceChange) planDto.stages.get(1).resourceChanges.get("wood")).value(), is(0));
    }
    finally {
      Files.deleteIfExists(planFile);
    }
  }

  @Test
  public void testGetPlan_invalidPlanName() {
    String invalidPlanName = "../../../path/to/invalid/plan";
    String encodedPlanName = URLEncoder.encode(invalidPlanName, StandardCharsets.UTF_8);
    var response = RestAssured.given() //
            .header("Accept", "application/json") //
            .when().get("/users/" + TEST_USER + "/plans/" + encodedPlanName) //
            .then().extract();
    int statusCode = response.statusCode();
    String body = response.body().asString();
    // Expecting 400 Bad Request
    assertThat(statusCode, is(400));
    assertThat(body, containsString("Invalid resource name"));
    assertThat(body, containsString(invalidPlanName));
    assertThat(body, containsString("only alphanumeric characters or underscores"));
  }

  @Test
  public void testCreatePlan_userDoesNotExist_gameExists() throws Exception {
    String gameName = "TestGameA";
    String gameFileName = gameName + ".json";
    Path gamesDir = Paths.get("build/test-gameplan-data/.games");
    Files.createDirectories(gamesDir);
    Path gameFile = gamesDir.resolve(gameFileName);
    String gameJson = "{\"name\":\"TestGameA\"}";
    Files.writeString(gameFile, gameJson);
    String nonExistentUser = "NonExistentUser";
    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().post("/users/" + nonExistentUser + "/plans/" + gameName) //
              .then().extract();
      assertThat(response.statusCode(), is(404));
      String body = response.body().asString();
      assertThat(body, containsString("User not found"));
    }
    finally {
      Files.deleteIfExists(gameFile);
    }
  }

  @Test
  public void testCreatePlan_userExists_gameDoesNotExist() throws Exception {
    String user = "TestUser2";
    String nonExistentGame = "NonExistentGame";
    var response = RestAssured.given() //
            .header("Accept", "application/json") //
            .when().post("/users/" + user + "/plans/" + nonExistentGame) //
            .then().extract();
    assertThat(response.statusCode(), is(404));
    String body = response.body().asString();
    assertThat(body, containsString("User not found"));
    assertThat(body, containsString(user));
  }

  @Test
  public void testCreatePlan_userAndGameExist() throws Exception {
    String user = "TestUser3";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String gameName = "TestGameB";
    String gameFileName = gameName + ".json";
    Path gamesDir = Paths.get("build/test-gameplan-data/.games");
    Files.createDirectories(gamesDir);
    Path gameFile = gamesDir.resolve(gameFileName);
    String gameJson = "{\"name\":\"TestGameB\"}";
    Files.writeString(gameFile, gameJson);
    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().post("/users/" + user + "/plans/" + gameName) //
              .then().statusCode(201) //
              .extract();
      PlanDto planDto = response.body().as(PlanDto.class);
      assertThat(planDto.gameName, is(gameName));
      assertThat(planDto.name, containsString(gameName));
    }
    finally {
      Files.deleteIfExists(gameFile);
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testCreatePlan_invalidGameName() throws Exception {
    String user = "TestUser4";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String invalidGameName = "../../../path/to/invalid/game";
    String encodedGameName = URLEncoder.encode(invalidGameName, StandardCharsets.UTF_8);
    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().post("/users/" + user + "/plans/" + encodedGameName) //
              .then().extract();
      assertThat(response.statusCode(), is(400));
      String body = response.body().asString();
      assertThat(body, containsString("Invalid resource name"));
      assertThat(body, containsString(invalidGameName));
      assertThat(body, containsString("only alphanumeric characters or underscores"));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testClonePlan_userDoesNotExist() throws Exception {
    String user = "TestUserClone1";
    String originalPlanName = "NonExistentPlan";
    PlanCloneDto cloneDto = new PlanCloneDto();
    cloneDto.originalPlanName = originalPlanName;
    var response = RestAssured.given() //
            .contentType("application/json") //
            .body(cloneDto) //
            .when().post("/users/" + user + "/plans") //
            .then().extract();
    assertThat(response.statusCode(), is(404));
    String body = response.body().asString();
    assertThat(body, containsString("Plan not found"));
  }

  @Test
  public void testClonePlan_planDoesNotExist() throws Exception {
    String user = "TestUserClone2";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String originalPlanName = "NonExistentPlan";
    PlanCloneDto cloneDto = new PlanCloneDto();
    cloneDto.originalPlanName = originalPlanName;
    try {
      var response = RestAssured.given() //
              .contentType("application/json") //
              .body(cloneDto) //
              .when().post("/users/" + user + "/plans") //
              .then().extract();
      assertThat(response.statusCode(), is(404));
      String body = response.body().asString();
      assertThat(body, containsString("Plan not found"));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testClonePlan_invalidOriginalPlanName() throws Exception {
    String user = "TestUserClone";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String invalidPlanName = "../../../path/to/invalid/plan";
    PlanCloneDto cloneDto = new PlanCloneDto();
    cloneDto.originalPlanName = invalidPlanName;

    try {
      var response = RestAssured.given() //
              .contentType("application/json") //
              .body(cloneDto) //
              .when().post("/users/" + user + "/plans") //
              .then().extract();
      assertThat(response.statusCode(), is(400));
      String body = response.body().asString();
      assertThat(body, containsString("Invalid resource name"));
      assertThat(body, containsString(invalidPlanName));
      assertThat(body, containsString("only alphanumeric characters or underscores"));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testClonePlan_happyPath() throws Exception {
    createTestGameFile("TestGame1");
    String user = "TestUserClone3";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String planName = "PlanToClone";
    Path planFile = userDir.resolve(planName + ".json");
    String planJson = """
            {
              "name": "PlanToClone",
              "gameName": "TestGame1",
              "description": "Original plan",
              "stages": [
                { "description": "Stage 1", "resourceChanges": {"gold": {"type": "simple", "value": 10}} }
              ]
            }
            """;
    Files.writeString(planFile, planJson);
    PlanCloneDto cloneDto = new PlanCloneDto();
    cloneDto.originalPlanName = planName;
    try {
      var response = RestAssured.given() //
              .contentType("application/json") //
              .body(cloneDto) //
              .when().post("/users/" + user + "/plans") //
              .then().statusCode(201).extract();

      PlanDto clonedPlan = response.body().as(PlanDto.class);
      assertThat(clonedPlan.name, not(planName)); // Should be a new unique name
      assertThat(clonedPlan.gameName, is("TestGame1"));
      assertThat(clonedPlan.description, containsString("Original plan"));
      assertThat(clonedPlan.stages, hasSize(1));
      assertThat(clonedPlan.stages.get(0).description, is("Stage 1"));
      assertThat(clonedPlan.stages.get(0).resourceChanges.get("gold"), instanceOf(SimpleResourceChange.class));
      assertThat(((SimpleResourceChange) clonedPlan.stages.get(0).resourceChanges.get("gold")).value(), is(10));
    }
    finally {
      Files.deleteIfExists(planFile);
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testUpdatePlan_userDoesNotExist() throws Exception {
    String user = "TestUserUpdate1";
    PlanDto planDto = new PlanDto();
    planDto.name = "NonExistentPlan";
    planDto.gameName = "TestGame1";
    planDto.description = "Should not update";
    var response = RestAssured.given() //
            .contentType("application/json") //
            .body(planDto) //
            .when().put("/users/" + user + "/plans") //
            .then().extract();
    assertThat(response.statusCode(), is(404));
    String body = response.body().asString();
    assertThat(body, containsString("Plan not found"));
  }

  @Test
  public void testUpdatePlan_planDoesNotExist() throws Exception {
    String user = "TestUserUpdate2";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    PlanDto planDto = new PlanDto();
    planDto.name = "NonExistentPlan";
    planDto.gameName = "TestGame1";
    planDto.description = "Should not update";
    try {
      var response = RestAssured.given() //
              .contentType("application/json") //
              .body(planDto) //
              .when().put("/users/" + user + "/plans") //
              .then().extract();
      assertThat(response.statusCode(), is(404));
      String body = response.body().asString();
      assertThat(body, containsString("Plan not found"));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testUpdatePlan_invalidPlanName() throws Exception {
    String user = "TestUserUpdateInvalid";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String invalidPlanName = "../../../path/to/invalid/plan";
    PlanDto planDto = new PlanDto();
    planDto.name = invalidPlanName;
    planDto.gameName = "TestGame1";
    planDto.description = "Should not update";
    try {
      var response = RestAssured.given() //
              .contentType("application/json") //
              .body(planDto) //
              .when().put("/users/" + user + "/plans") //
              .then().extract();
      assertThat(response.statusCode(), is(400));
      String body = response.body().asString();
      assertThat(body, containsString("Invalid resource name"));
      assertThat(body, containsString(invalidPlanName));
      assertThat(body, containsString("only alphanumeric characters or underscores"));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testUpdatePlan_happyPath() throws Exception {
    String user = "TestUserUpdate3";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String planName = "PlanToUpdate";
    Path planFile = userDir.resolve(planName + ".json");
    String planJson = """
            {
              "name": "PlanToUpdate",
              "gameName": "TestGame1",
              "description": "Original description",
              "stages": []
            }
            """;
    Files.writeString(planFile, planJson);
    PlanDto planDto = new PlanDto();
    planDto.name = planName;
    planDto.gameName = "TestGame1";
    planDto.description = "Updated description";
    planDto.stages = new java.util.ArrayList<>();
    net.tfassbender.gameplan.dto.PlanStageDto stage = new net.tfassbender.gameplan.dto.PlanStageDto();
    stage.description = "New Stage";
    stage.resourceChanges.put("gold", new SimpleResourceChange(99));
    planDto.stages.add(stage);
    try {
      var response = RestAssured.given() //
              .contentType("application/json") //
              .body(planDto) //
              .when().put("/users/" + user + "/plans") //
              .then().statusCode(200) //
              .extract();
      PlanDto updatedPlan = response.body().as(PlanDto.class);
      assertThat(updatedPlan.name, is(planName));
      assertThat(updatedPlan.description, is("Updated description"));
      assertThat(updatedPlan.stages, hasSize(1));
      assertThat(updatedPlan.stages.get(0).description, is("New Stage"));
      assertThat(updatedPlan.stages.get(0).resourceChanges.get("gold"), instanceOf(SimpleResourceChange.class));
      assertThat(((SimpleResourceChange) updatedPlan.stages.get(0).resourceChanges.get("gold")).value(), is(99));
      // Check file content
      String updatedFileContent = Files.readString(planFile);
      assertThat(updatedFileContent, containsString("Updated description"));
      assertThat(updatedFileContent, containsString("New Stage"));
    }
    finally {
      Files.deleteIfExists(planFile);
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testDeletePlan_userDoesNotExist() throws Exception {
    String user = "TestUserDelete1";
    String planName = "NonExistentPlan";
    var response = RestAssured.given() //
            .when().delete("/users/" + user + "/plans/" + planName) //
            .then().extract();
    assertThat(response.statusCode(), is(404));
    String body = response.body().asString();
    assertThat(body, containsString("Plan not found"));
  }

  @Test
  public void testDeletePlan_planDoesNotExist() throws Exception {
    String user = "TestUserDelete2";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String planName = "NonExistentPlan";
    try {
      var response = RestAssured.given() //
              .when().delete("/users/" + user + "/plans/" + planName) //
              .then().extract();
      assertThat(response.statusCode(), is(404));
      String body = response.body().asString();
      assertThat(body, containsString("Plan not found"));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testDeletePlan_invalidPlanName() throws Exception {
    String user = "TestUserDelete3";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String invalidPlanName = "../../../path/to/invalid/plan";
    String encodedPlanName = URLEncoder.encode(invalidPlanName, StandardCharsets.UTF_8);
    try {
      var response = RestAssured.given() //
              .when().delete("/users/" + user + "/plans/" + encodedPlanName) //
              .then().extract();
      assertThat(response.statusCode(), is(400));
      String body = response.body().asString();
      assertThat(body, containsString("Invalid resource name"));
      assertThat(body, containsString(invalidPlanName));
      assertThat(body, containsString("only alphanumeric characters or underscores"));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testDeletePlan_happyPath() throws Exception {
    String user = "TestUserDelete3";
    Path userDir = Paths.get("build/test-gameplan-data/.users/" + user);
    Files.createDirectories(userDir);
    String planName = "PlanToDelete";
    Path planFile = userDir.resolve(planName + ".json");
    String planJson = """
            {
              "name": "PlanToDelete",
              "gameName": "TestGame1",
              "description": "Plan to be deleted",
              "stages": []
            }
            """;
    Files.writeString(planFile, planJson);
    try {
      var response = RestAssured.given() //
              .when().delete("/users/" + user + "/plans/" + planName) //
              .then().statusCode(204) //
              .extract();
      assertThat(Files.exists(planFile), is(false));
    }
    finally {
      deleteDirectoryRecursively(userDir);
    }
  }

  @Test
  public void testGetPlan_withPowerResourceChange() throws Exception {
    String planName = "TestPlanPower";
    Path planFile = USER_DIR.resolve(planName + ".json");
    String planJson = """
            {
              "name": "TestPlanPower",
              "gameName": "TestGame1",
              "description": "A test plan with power",
              "stages": [
                {
                  "description": "Stage 1",
                  "resourceChanges": {"TERRA_MYSTICA_POWER": {"type": "terra_mystica_power", "bowl1": 1, "bowl2": 2, "bowl3": 3}}
                }
              ]
            }
            """;
    Files.writeString(planFile, planJson);
    try {
      var response = RestAssured.given() //
              .header("Accept", "application/json") //
              .when().get("/users/" + TEST_USER + "/plans/" + planName) //
              .then().statusCode(200).extract();
      PlanDto planDto = response.body().as(PlanDto.class);
      assertThat(planDto.name, is(planName));
      assertThat(planDto.stages, hasSize(1));
      assertThat(planDto.stages.get(0).resourceChanges.get("TERRA_MYSTICA_POWER"), instanceOf(TerraMysticaPowerResourceChange.class));
      TerraMysticaPowerResourceChange power = (TerraMysticaPowerResourceChange) planDto.stages.get(0).resourceChanges.get("TERRA_MYSTICA_POWER");
      assertThat(power.bowl1(), is(1));
      assertThat(power.bowl2(), is(2));
      assertThat(power.bowl3(), is(3));
    }
    finally {
      Files.deleteIfExists(planFile);
    }
  }

  private void deleteDirectoryRecursively(Path dir) throws IOException {
    if (Files.exists(dir)) {
      try (var files = Files.walk(dir)) {
        files.sorted((a, b) -> b.compareTo(a)) // delete children before parents
                .forEach(path -> {
                  try {
                    Files.deleteIfExists(path);
                  }
                  catch (IOException e) {
                    throw new RuntimeException(e);
                  }
                });
      }
    }
  }

  private void createTestGameFile(String gameName) throws IOException {
    Files.createDirectories(GAMES_DIR);
    Path testGameFile = GAMES_DIR.resolve(gameName + ".json");
    String minimalGameDtoJson = """
            {
              "name":"TestGame1",
              "description":"A test game",
              "resources":{"gold":"SIMPLE"},
              "defaultStartingResources":{
                "description":"Start",
                "resourceChanges":{"gold":{ "type": "simple", "value":100 }}
              }
            }
            """;
    Files.writeString(testGameFile, minimalGameDtoJson);
  }
}
