package net.tfassbender.gameplan.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

@QuarkusTest
public class UsersResourceTest {

  private static final Logger log = LoggerFactory.getLogger(UsersResourceTest.class);
  private static final String TEST_USER = "TestUser1";
  private static final Path USER_DIR = Paths.get("build/test-gameplan-data/.users/" + TEST_USER);

  @Test
  public void testCreateUser_createsDirectory() throws Exception {
    // Send POST request to create user
    int statusCode = RestAssured.given().header("Content-Type", "application/json") //
            .when().post("/users/" + TEST_USER) //
            .then().extract().statusCode();
    log.info("POST /users/{} response status: {}", TEST_USER, statusCode);
    assertThat(statusCode, is(200));

    // Check if directory was created
    boolean dirExists = Files.exists(USER_DIR) && Files.isDirectory(USER_DIR);
    log.info("User directory exists: {}", dirExists);
    assertThat(dirExists, is(true));
  }

  @AfterEach
  public void cleanup() throws Exception {
    if (Files.exists(USER_DIR)) {
      Files.delete(USER_DIR);
      log.info("Cleaned up user directory: {}", USER_DIR);
    }
  }
}
