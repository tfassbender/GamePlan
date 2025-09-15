package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("tm_power")
public record PowerResourceChange(int bowl1, int bowl2, int bowl3) implements ResourceChangeValue {}
