package net.tfassbender.gameplan.dto;

public enum ResourceType {

  SIMPLE, // uses a simple integer value to represent the amount of resource
  SIMPLE_COMBINED, // uses a simple integer value to represent the amount of resource, but combines multiple resources into one input
  ABSOLUTE, // uses an absolute integer value to represent the amount of resource
  ONE_TIME_COMBINED, // combines multiple one-time resources (like buildings that can be built only once) into one input

  // Game-specific resource types
  TERRA_MYSTICA_POWER, //
  TERRA_MYSTICA_CULTS, //
}
