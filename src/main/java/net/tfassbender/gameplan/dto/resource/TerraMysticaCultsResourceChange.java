package net.tfassbender.gameplan.dto.resource;

import com.fasterxml.jackson.annotation.JsonTypeName;
import net.tfassbender.gameplan.dto.ResourceChangeValue;

@JsonTypeName("terra_mystica_cults")
public record TerraMysticaCultsResourceChange(int fire, int water, int earth, int air) implements ResourceChangeValue {}
