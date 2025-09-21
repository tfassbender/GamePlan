package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("terra_mystica_cults")
public record TerraMysticaCultsResourceChange(int fire, int water, int earth, int air) implements ResourceChangeValue {}
