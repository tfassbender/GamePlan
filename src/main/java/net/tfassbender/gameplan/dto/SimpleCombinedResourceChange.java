package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.Map;

@JsonTypeName("simple_combined")
public record SimpleCombinedResourceChange(Map<String, Integer> resources, Map<String, String> colors) implements ResourceChangeValue {}
