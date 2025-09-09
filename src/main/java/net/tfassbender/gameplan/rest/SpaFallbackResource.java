package net.tfassbender.gameplan.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.InputStream;

@Path("/app")
public class SpaFallbackResource {

  @GET
  @Path("{path:.*}")
  @Produces(MediaType.TEXT_HTML)
  public Response forwardToIndex() {
    // Always serve index.html for non-file requests
    InputStream indexHtml = getClass().getResourceAsStream("/META-INF/resources/app/index.html");
    if (indexHtml == null) {
      return Response.status(404).entity("index.html not found").build();
    }
    return Response.ok(indexHtml).build();
  }
}