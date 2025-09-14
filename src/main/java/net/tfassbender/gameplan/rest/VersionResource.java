package net.tfassbender.gameplan.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.gameplan.dto.ErrorResponse;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Map;

/**
 * Simple REST endpoint for retrieving the application version.
 */
@Path("/version")
@Produces(MediaType.APPLICATION_JSON)
public class VersionResource {

  @ConfigProperty(name = "application.version")
  private String applicationVersion;

  @GET
  public Response getVersion() {
    if (applicationVersion == null || applicationVersion.isBlank()) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Application version is not set")).build();
    }

    // return response in a map, so it's parsed as JSON
    return Response.ok(Map.of("version", applicationVersion)).build();
  }
}
