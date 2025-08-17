package net.tfassbender.gameplan.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;

@QuarkusTest
public class HomeResourceTest {

  private static final Logger log = LoggerFactory.getLogger(HomeResourceTest.class);

  @Test
  public void testHomeEndpoint() {
    String response = RestAssured.given() //
            .when().get("/") //
            .then().statusCode(200).extract().asString();
    log.info("Response from / endpoint: {}", response);
    assertThat(response, containsString("GamePlan"));
  }

  @Test
  public void testWelcomeEndpoint() {
    String response = RestAssured.given() //
            .when().get("/home/welcome") //
            .then().statusCode(200).extract().asString();
    log.info("Response from /home/welcome endpoint: {}", response);
    assertThat(response, containsString("GamePlan"));
  }
}
