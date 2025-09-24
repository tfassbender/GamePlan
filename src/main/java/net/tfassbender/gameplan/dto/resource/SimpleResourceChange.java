package net.tfassbender.gameplan.dto.resource;

import com.fasterxml.jackson.annotation.JsonTypeName;
import net.tfassbender.gameplan.dto.ResourceChangeValue;

@JsonTypeName("simple")
public record SimpleResourceChange(int value) implements ResourceChangeValue {}
