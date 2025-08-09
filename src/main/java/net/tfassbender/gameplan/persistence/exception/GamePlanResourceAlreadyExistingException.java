package net.tfassbender.gameplan.persistence.exception;

import java.io.Serial;

public class GamePlanResourceAlreadyExistingException extends GamePlanPersistenceException {

  @Serial
  private static final long serialVersionUID = 1L;

  public GamePlanResourceAlreadyExistingException(String message) {
    super(message);
  }

  public GamePlanResourceAlreadyExistingException(String message, Throwable cause) {
    super(message, cause);
  }
}
