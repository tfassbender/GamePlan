package net.tfassbender.gameplan.dto.resource;

import com.fasterxml.jackson.annotation.JsonTypeName;
import net.tfassbender.gameplan.dto.ResourceChangeValue;

@JsonTypeName("terra_mystica_power")
public record TerraMysticaPowerResourceChange(int bowl1, int bowl2, int bowl3, int gain, int burn, int use) implements ResourceChangeValue {}
