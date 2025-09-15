package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({@JsonSubTypes.Type(value = SimpleResourceChange.class, name = "simple"), @JsonSubTypes.Type(value = PowerResourceChange.class, name = "tm_power")})
public interface ResourceChangeValue {}
