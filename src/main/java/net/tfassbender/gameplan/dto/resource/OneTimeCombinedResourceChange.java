package net.tfassbender.gameplan.dto.resource;

import com.fasterxml.jackson.annotation.JsonTypeName;
import net.tfassbender.gameplan.dto.ResourceChangeValue;

import java.util.Map;

@JsonTypeName("one_time_combined")
public record OneTimeCombinedResourceChange(Map<String, Boolean> resources, Map<String, String> colors) implements ResourceChangeValue {}
