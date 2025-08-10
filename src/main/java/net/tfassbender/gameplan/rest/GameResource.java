package net.tfassbender.gameplan.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.gameplan.dto.ErrorResponse;
import net.tfassbender.gameplan.dto.GameDto;
import net.tfassbender.gameplan.persistence.GameService;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceNotFoundException;

import java.util.List;

@Path("/game-plan/games")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GameResource {

  @Inject
  private GameService gameService;

  @GET
  public Response getGames() {
    List<String> gameNames;
    try {
      gameNames = gameService.getGameNames();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND) //
              .entity(new ErrorResponse("No game configurations found: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR) //
              .entity(new ErrorResponse("Failed to retrieve game configurations: " + e.getMessage())).build();
    }

    if (gameNames.isEmpty()) {
      return Response.status(Response.Status.NOT_FOUND) //
              .entity(new ErrorResponse("No game configurations found.")).build();
    }

    return Response.ok(gameNames).build();
  }

  @Path("/{gameName}")
  @GET
  public Response getGameDetails(@PathParam("gameName") String gameName) {
    try {
      GameDto gameDetails = gameService.getGame(gameName);
      return Response.ok(gameDetails).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND) //
              .entity(new ErrorResponse("Config for a game with name '" + gameName + "' not found.")).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR) //
              .entity(new ErrorResponse("Failed to retrieve game details for '" + gameName + "': " + e.getMessage())).build();
    }
  }
}
