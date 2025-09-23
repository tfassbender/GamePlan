package net.tfassbender.gameplan.dto;

public enum ResourceType {

  SIMPLE, // uses a simple integer value to represent the amount of resource
  SIMPLE_COMBINED, // uses a simple integer value to represent the amount of resource, but combines multiple resources into one input
  ABSOLUTE, // uses an absolute integer value to represent the amount of resource
  TERRA_MYSTICA_POWER, //
  TERRA_MYSTICA_CULTS, //
}
