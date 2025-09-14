package net.tfassbender.gameplan.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.gameplan.dto.ErrorResponse;
import net.tfassbender.gameplan.dto.PlanCloneDto;
import net.tfassbender.gameplan.dto.PlanDto;
import net.tfassbender.gameplan.exception.GamePlanInvalidResourceNameException;
import net.tfassbender.gameplan.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.exception.GamePlanResourceNotFoundException;
import net.tfassbender.gameplan.persistence.PlanService;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Path("users/{username}/plans")
@Produces(MediaType.APPLICATION_JSON)
public class PlanResource {

  @Inject
  private PlanService planService;

  @GET
  public Response getPlans(@PathParam("username") String username) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);

    try {
      List<String> planNames = planService.getPlanNames(decodedUsername);
      return Response.ok(planNames).build();
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid user name: " + e.getMessage())).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("User not found '" + decodedUsername + "'.")).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving plans: " + e.getMessage()).build();
    }
  }

  @Path("/{planName}")
  @GET
  public Response getPlan(@PathParam("username") String username, @PathParam("planName") String planName) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);
    String decodedPlanName = URLDecoder.decode(planName, StandardCharsets.UTF_8);

    try {
      PlanDto planDto = planService.getPlan(decodedUsername, decodedPlanName);
      return Response.ok(planDto).build();
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid resource name: " + e.getMessage())).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("Plan not found: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error retrieving plan: " + e.getMessage())).build();
    }
  }

  @Path("/{gameName}")
  @POST
  public Response createPlan(@PathParam("username") String username, @PathParam("gameName") String gameName) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);
    String decodedGameName = URLDecoder.decode(gameName, StandardCharsets.UTF_8);

    try {
      PlanDto planDto = planService.createPlan(decodedUsername, decodedGameName);
      return Response.status(Response.Status.CREATED).entity(planDto).build();
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid resource name: " + e.getMessage())).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("User not found '" + decodedUsername + "'.")).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error creating plan: " + e.getMessage())).build();
    }
  }

  @POST
  public Response clonePlan(@PathParam("username") String username, PlanCloneDto planCloneDto) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);

    try {
      PlanDto originalPlan = planService.getPlan(decodedUsername, planCloneDto.originalPlanName);
      PlanDto clonedPlan = planService.createPlan(decodedUsername, originalPlan.gameName);
      clonedPlan.stages = originalPlan.stages; // Copy stages from the original plan
      clonedPlan.description = "Cloned from '" + originalPlan.name + "'\n" + originalPlan.description;
      planService.savePlan(decodedUsername, clonedPlan); // Save the cloned plan

      return Response.status(Response.Status.CREATED).entity(clonedPlan).build();
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid resource name: " + e.getMessage())).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("Plan not found: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error cloning plan: " + e.getMessage())).build();
    }
  }

  @PUT
  @Consumes(MediaType.APPLICATION_JSON)
  public Response updatePlan(@PathParam("username") String username, PlanDto planDto) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);

    try {
      PlanDto updatedPlan = planService.savePlan(decodedUsername, planDto);
      return Response.ok(updatedPlan).build();
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid resource name: " + e.getMessage())).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("Plan not found: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error updating plan: " + e.getMessage())).build();
    }
  }

  @Path("/{planName}")
  @DELETE
  public Response deletePlan(@PathParam("username") String username, @PathParam("planName") String planName) {
    String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8);
    String decodedPlanName = URLDecoder.decode(planName, StandardCharsets.UTF_8);

    try {
      planService.deletePlan(decodedUsername, decodedPlanName);
      return Response.noContent().build();
    }
    catch (GamePlanInvalidResourceNameException e) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("Invalid resource name: " + e.getMessage())).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("Plan not found: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error deleting plan: " + e.getMessage())).build();
    }
  }
}
