package net.tfassbender.gameplan.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;

@QuarkusTest
public class UsersResourceTest {

  private static final Logger log = LoggerFactory.getLogger(UsersResourceTest.class);
  private static final String TEST_USER = "TestUser1";
  private static final Path USER_DIR = Paths.get("build/test-gameplan-data/.users/" + TEST_USER);

  @AfterEach
  public void cleanup() throws Exception {
    if (Files.exists(USER_DIR)) {
      Files.delete(USER_DIR);
      log.info("Cleaned up user directory: {}", USER_DIR);
    }
  }

  @Test
  public void testCreateUser_createsDirectory() throws Exception {
    // Send POST request to create user
    int statusCode = RestAssured.given() //
            .header("Content-Type", "application/json") //
            .when().post("/users/" + TEST_USER) //
            .then().extract().statusCode();
    log.info("POST /users/{} response status: {}", TEST_USER, statusCode);
    assertThat(statusCode, is(201)); // Expecting 201 Created

    // Check if directory was created
    boolean dirExists = Files.exists(USER_DIR) && Files.isDirectory(USER_DIR);
    log.info("User directory exists: {}", dirExists);
    assertThat(dirExists, is(true));
  }

  @Test
  public void testCreateUser_invalidName() throws Exception {
    String invalidUser = "../../../path/to/invalid/user";
    String encodedUser = URLEncoder.encode(invalidUser, java.nio.charset.StandardCharsets.UTF_8);
    var response = RestAssured.given() //
            .header("Content-Type", "application/json") //
            .when().post("/users/" + encodedUser) //
            .then().extract();
    int statusCode = response.statusCode();
    String body = response.body().asString();
    log.info("POST /users/{} response status: {} body: {}", encodedUser, statusCode, body);
    // Expecting 400 Bad Request
    assertThat(statusCode, is(400));
    assertThat(body, containsString("Invalid username"));
    assertThat(body, containsString(invalidUser));
    assertThat(body, containsString("only alphanumeric characters or underscores"));
  }
}
