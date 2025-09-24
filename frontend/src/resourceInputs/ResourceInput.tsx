import React from "react";
import ResourceInputPower from "./ResourceInputPower";
import ResourceInputCults from "./ResourceInputCults";
import ResourceInputSimpleCombined from "./ResourceInputSimpleCombined";
import ResourceInputAbsolute from "./ResourceInputAbsolute";
import ResourceInputOneTimeCombined from "./ResourceInputOneTimeCombined";

export enum ResourceInputType {
  SIMPLE = "SIMPLE",
  SIMPLE_COMBINED = "SIMPLE_COMBINED",
  ABSOLUTE = "ABSOLUTE",
  TERRA_MYSTICA_POWER = "TERRA_MYSTICA_POWER",
  TERRA_MYSTICA_CULTS = "TERRA_MYSTICA_CULTS",
  ONE_TIME_COMBINED = "ONE_TIME_COMBINED"
}

// Type for TERRA_MYSTICA_CULTS
export interface CultsValue {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

// Type for TERRA_MYSTICA_POWER
export interface PowerValue {
  bowl1: number;
  bowl2: number;
  bowl3: number;
  gain: number;
  burn: number;
  use: number;
}

// Type for SIMPLE_COMBINED
export interface SimpleCombinedResourceChangeValue {
  resources: Record<string, number>;
  colors?: Record<string, string>;
}

// Type for ONE_TIME_COMBINED
export interface OneTimeCombinedResourceChangeValue {
  resources: Record<string, boolean | undefined>;
  colors?: Record<string, string>;
}

// Discriminated union for props
export type ResourceInputProps =
  | {
      resource: string;
      value: number;
      onChange: (value: number) => void;
      type?: ResourceInputType.SIMPLE;
      showDetails?: boolean;
      onToggleShowDetails?: () => void;
    }
  | {
      resource: string;
      value: PowerValue;
      onChange: (value: PowerValue) => void;
      type: ResourceInputType.TERRA_MYSTICA_POWER;
      showDetails?: boolean;
      onToggleShowDetails?: () => void;
    }
  | {
      resource: string;
      value: CultsValue;
      onChange: (value: CultsValue) => void;
      type: ResourceInputType.TERRA_MYSTICA_CULTS;
      showDetails?: boolean;
      onToggleShowDetails?: () => void;
    }
  | {
      resource: string;
      value: SimpleCombinedResourceChangeValue;
      onChange: (value: SimpleCombinedResourceChangeValue) => void;
      type: ResourceInputType.SIMPLE_COMBINED;
      showDetails?: boolean;
      onToggleShowDetails?: () => void;
    }
  | {
      resource: string;
      value: OneTimeCombinedResourceChangeValue;
      onChange: (value: OneTimeCombinedResourceChangeValue) => void;
      type: ResourceInputType.ONE_TIME_COMBINED;
      showDetails?: boolean;
      onToggleShowDetails?: () => void;
    }
  | {
      resource: string;
      value: number | null;
      onChange: (value: number | null) => void;
      type: ResourceInputType.ABSOLUTE;
      showDetails?: boolean;
      onToggleShowDetails?: () => void;
    };

const ResourceInput: React.FC<ResourceInputProps> = props => {
  const { resource, showDetails = true, onToggleShowDetails } = props;
  switch (props.type) {
    case ResourceInputType.TERRA_MYSTICA_POWER:
      return (
        <ResourceInputPower
          {...props}
          showDetails={!!props.showDetails}
          onToggleShowDetails={props.onToggleShowDetails ?? (() => {})}
        />
      );
    case ResourceInputType.TERRA_MYSTICA_CULTS:
        return (
          <ResourceInputCults
            {...props}
            showDetails={!!props.showDetails}
            onToggleShowDetails={props.onToggleShowDetails ?? (() => {})}
          />
        );
    case ResourceInputType.SIMPLE_COMBINED:
        return (
          <ResourceInputSimpleCombined
            {...props}
            showDetails={!!props.showDetails}
            onToggleShowDetails={props.onToggleShowDetails ?? (() => {})}
          />
        );
    case ResourceInputType.ABSOLUTE:
        return (
          <ResourceInputAbsolute
            {...props}
            showDetails={!!props.showDetails}
            onToggleShowDetails={props.onToggleShowDetails ?? (() => {})}
          />
        );
    case ResourceInputType.ONE_TIME_COMBINED: {
      const { value, onChange, resource, showDetails, onToggleShowDetails } = props as any;
      return (
        <ResourceInputOneTimeCombined
          resources={value.resources}
          colors={value.colors}
          onChange={onChange}
          showDetails={!!showDetails}
          onToggleShowDetails={onToggleShowDetails ?? (() => {})}
          resource={resource}
        />
      );
    }
    default:
      // SIMPLE
      const value = props.value as number;
      const [localNumValue, setLocalNumValue] = React.useState(value);
      React.useEffect(() => {
        setLocalNumValue(value);
      }, [value]);
      const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalNumValue(Number(e.target.value));
      };
      const handleNumBlur = () => {
        props.onChange(localNumValue);
      };
      const handleDecrement = () => {
        setLocalNumValue(v => {
          const newValue = v - 1;
          props.onChange(newValue);
          return newValue;
        });
      };
      const handleIncrement = () => {
        setLocalNumValue(v => {
          const newValue = v + 1;
          props.onChange(newValue);
          return newValue;
        });
      };
      return (
        <div className="resource-input">
          <div className="resource-input-row">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={onToggleShowDetails}
              id={`show-simple-details-${resource}`}
            />
            <label className="resource-input-label" htmlFor={`show-simple-details-${resource}`}>{resource}</label>
            {!showDetails && (
              <span className="resource-input-hidden-value">{value}</span>
            )}
          </div>
          {showDetails && (
            <>
              <button
                type="button"
                className="resource-input-btn resource-input-btn-decrement"
                onClick={handleDecrement}
                aria-label={`Decrease ${resource}`}
              >−</button>
              <input
                className="resource-input-spinner"
                type="number"
                value={localNumValue}
                onChange={handleNumChange}
                onBlur={handleNumBlur}
                step={1}
                inputMode="numeric"
              />
              <button
                type="button"
                className="resource-input-btn resource-input-btn-increment"
                onClick={handleIncrement}
                aria-label={`Increase ${resource}`}
              >+</button>
            </>
          )}
        </div>
      );
  }
};

export default ResourceInput;
