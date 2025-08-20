package net.tfassbender.gameplan.exception;

public class GamePlanInvalidResourceNameException extends GamePlanPersistenceException {

  public GamePlanInvalidResourceNameException(String message) {
    super(message);
  }

  public GamePlanInvalidResourceNameException(String message, Throwable cause) {
    super(message, cause);
  }
}
