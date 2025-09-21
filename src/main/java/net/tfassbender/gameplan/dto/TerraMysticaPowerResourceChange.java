package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("terra_mystica_power")
public record TerraMysticaPowerResourceChange(int bowl1, int bowl2, int bowl3, int gain, int burn, int use) implements ResourceChangeValue {}
