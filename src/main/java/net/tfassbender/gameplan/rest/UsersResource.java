package net.tfassbender.gameplan.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.gameplan.dto.ErrorResponse;
import net.tfassbender.gameplan.persistence.UserService;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceAlreadyExistingException;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsersResource {

  @Inject
  private UserService userService;

  @Path("/{username}")
  @POST
  public Response createUser(@PathParam("username") String username) {
    try {
      userService.createUser(username);
    }
    catch (GamePlanResourceAlreadyExistingException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("User '" + username + "' already exists.")).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Failed to create user '" + username + "': " + e.getMessage())).build();
    }

    return Response.ok().build();
  }
}
