package net.tfassbender.gameplan.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Simple REST endpoint for testing the home page.
 */
@Path("/home")
public class HomeResource {

  @GET
  @Path("/welcome")
  @Produces(MediaType.TEXT_PLAIN)
  public Response welcome() {
    return Response.ok("Welcome to GamePlan\n\nThe project is in development - currently there is nothing to see here.").build();
  }
}
