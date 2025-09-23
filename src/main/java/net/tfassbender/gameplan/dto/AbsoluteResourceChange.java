package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("absolute")
public record AbsoluteResourceChange(Integer value) implements ResourceChangeValue {}
