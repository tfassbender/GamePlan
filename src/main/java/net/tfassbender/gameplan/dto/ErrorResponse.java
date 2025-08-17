package net.tfassbender.gameplan.dto;

public class ErrorResponse {

  public String message;

  public ErrorResponse(String message) {
    this.message = message;
  }

  public String toString() {
    return "ErrorResponse{" + "message='" + message + '\'' + '}';
  }
}
