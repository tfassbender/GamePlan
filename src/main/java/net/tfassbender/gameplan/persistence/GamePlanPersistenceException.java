package net.tfassbender.gameplan.persistence;

import java.io.Serial;

public class GamePlanPersistenceException extends Exception {

    @Serial
    private static final long serialVersionUID = 1L;

    public GamePlanPersistenceException(String message) {
        super(message);
    }

    public GamePlanPersistenceException(String message, Throwable cause) {
        super(message, cause);
    }

    public GamePlanPersistenceException(Throwable cause) {
        super(cause);
    }

}
