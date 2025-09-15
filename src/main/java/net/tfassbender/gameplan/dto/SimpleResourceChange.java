package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("simple")
public record SimpleResourceChange(int value) implements ResourceChangeValue {}
