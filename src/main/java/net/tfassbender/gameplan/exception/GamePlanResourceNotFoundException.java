package net.tfassbender.gameplan.exception;

import java.io.Serial;

public class GamePlanResourceNotFoundException extends GamePlanPersistenceException {

  @Serial
  private static final long serialVersionUID = 1L;

  public GamePlanResourceNotFoundException(String message) {
    super(message);
  }

  public GamePlanResourceNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
