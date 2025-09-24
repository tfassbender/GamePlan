package net.tfassbender.gameplan.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import net.tfassbender.gameplan.dto.resource.*;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({ //
        // Generic Resource Changes
        @JsonSubTypes.Type(value = SimpleResourceChange.class, name = "simple"),  //
        @JsonSubTypes.Type(value = SimpleCombinedResourceChange.class, name = "simple_combined"), //
        @JsonSubTypes.Type(value = AbsoluteResourceChange.class, name = "absolute"), //
        @JsonSubTypes.Type(value = OneTimeCombinedResourceChange.class, name = "one_time_combined"), //

        // Specialized Resource Changes
        @JsonSubTypes.Type(value = TerraMysticaPowerResourceChange.class, name = "terra_mystica_power"), //
        @JsonSubTypes.Type(value = TerraMysticaCultsResourceChange.class, name = "terra_mystica_cults")  //
})
public interface ResourceChangeValue {}
