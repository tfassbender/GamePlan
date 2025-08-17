package net.tfassbender.gameplan.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.gameplan.dto.ErrorResponse;
import net.tfassbender.gameplan.dto.PlanCloneDto;
import net.tfassbender.gameplan.dto.PlanDto;
import net.tfassbender.gameplan.persistence.PlanService;
import net.tfassbender.gameplan.persistence.exception.GamePlanPersistenceException;
import net.tfassbender.gameplan.persistence.exception.GamePlanResourceNotFoundException;

import java.util.List;

@Path("/{username}/plans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PlanResource {

  @Inject
  private PlanService planService;

  @GET
  public Response getPlans(@PathParam("username") String username) {
    try {
      List<String> planNames = planService.getPlanNames(username);
      return Response.ok(planNames).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("User not found '" + username + "'.")).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving plans: " + e.getMessage()).build();
    }
  }

  @Path("/{planName}")
  @GET
  public Response getPlan(@PathParam("username") String username, @PathParam("planName") String planName) {
    try {
      PlanDto planDto = planService.getPlan(username, planName);
      return Response.ok(planDto).build();
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
  public Response newPlan(@PathParam("username") String username, @PathParam("gameName") String gameName) {
    try {
      PlanDto planDto = planService.createPlan(username, gameName);
      return Response.status(Response.Status.CREATED).entity(planDto).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("User not found '" + username + "'.")).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error creating plan: " + e.getMessage())).build();
    }
  }

  @POST
  public Response clonePlan(@PathParam("username") String username, PlanCloneDto planCloneDto) {
    try {
      PlanDto originalPlan = planService.getPlan(username, planCloneDto.originalPlanName);
      PlanDto clonedPlan = planService.createPlan(username, originalPlan.gameName);
      clonedPlan.stages = originalPlan.stages; // Copy stages from the original plan
      clonedPlan.description = originalPlan.description;
      planService.savePlan(username, clonedPlan); // Save the cloned plan

      return Response.status(Response.Status.CREATED).entity(clonedPlan).build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("Plan not found: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error cloning plan: " + e.getMessage())).build();
    }
  }

  @PUT
  public Response updatePlan(@PathParam("username") String username, PlanDto planDto) {
    try {
      PlanDto updatedPlan = planService.savePlan(username, planDto);
      return Response.ok(updatedPlan).build();
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
    try {
      planService.deletePlan(username, planName);
      return Response.noContent().build();
    }
    catch (GamePlanResourceNotFoundException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("Plan not found: " + e.getMessage())).build();
    }
    catch (GamePlanPersistenceException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("Error deleting plan: " + e.getMessage())).build();
    }
  }
}
