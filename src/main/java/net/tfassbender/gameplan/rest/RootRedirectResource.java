package net.tfassbender.gameplan.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

@Path("/")
public class RootRedirectResource {

  @GET
  public Response redirectToApp() {
    return Response.status(302).header("Location", "/app/").build();
  }
}
