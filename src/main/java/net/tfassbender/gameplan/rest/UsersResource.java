package net.tfassbender.gameplan.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.gameplan.dto.ErrorResponse;
import net.tfassbender.gameplan.exception.GamePlanInvalidResourceNameException;
import net.tfassbender.gameplan.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.exception.GamePlanResourceAlreadyExistingException;
import net.tfassbender.gameplan.persistence.UserService;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsersResource {

  @Inject
  private UserService userService;

  @Path("/{username}")
  @POST
  public Response createUser(@PathParam("username") String username) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);
    try {
      // decode username to handle URL encoding
      userService.createUser(decodedUsername);
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid username: " + e.getMessage())).build();
    }
    catch (GamePlanResourceAlreadyExistingException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("User '" + decodedUsername + "' already exists.")).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Failed to create user '" + decodedUsername + "': " + e.getMessage())).build();
    }

    return Response.status(Response.Status.CREATED).build();
  }

  @Path("/{username}")
  @GET
  public Response userExists(@PathParam("username") String username) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);
    boolean exists;
    try {
      exists = userService.userExists(decodedUsername);
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid username: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Failed to check existence of user '" + decodedUsername + "': " + e.getMessage())).build();
    }

    if (exists) {
      return Response.ok().build();
    }
    else {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("User '" + decodedUsername + "' does not exist.")).build();
    }
  }
}
