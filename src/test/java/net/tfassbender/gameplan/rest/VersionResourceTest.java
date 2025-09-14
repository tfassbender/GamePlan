package net.tfassbender.gameplan.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;

@QuarkusTest
public class VersionResourceTest {

  private static final Logger log = LoggerFactory.getLogger(VersionResourceTest.class);

  @Test
  public void testHomeEndpoint() {
    String response = RestAssured.given() //
            .when().get("/") //
            .then().statusCode(200).extract().asString();
    log.info("Response from / endpoint: {}", response);
    assertThat(response, containsString("GamePlan"));
  }

  @Test
  public void testVersionEndpoint() {
    String response = RestAssured.given() //
            .when().get("/version") //
            .then().statusCode(200).extract().asString();
    log.info("Response from /home/welcome endpoint: {}", response);
    assertThat(response, containsString("version"));
    // Assert that the version field contains a semantic version (e.g., 1.2.3, 1.2.3-beta, etc.)
    Pattern semanticVersionPattern = Pattern.compile("\"version\"\s*:\s*\"(\\d+\\.\\d+\\.\\d+(?:-[A-Za-z0-9.-]+)?(?:\\+[A-Za-z0-9.-]+)?)\"");
    Matcher matcher = semanticVersionPattern.matcher(response);
    assertThat("Response should contain a semantic version in the 'version' field", matcher.find());
  }
}
