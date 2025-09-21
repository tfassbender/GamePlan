import React from "react";
import ResourceInputPower from "./ResourceInputPower";
import ResourceInputCults from "./ResourceInputCults";
import ResourceInputSimpleCombined from "./ResourceInputSimpleCombined";

export enum ResourceInputType {
  SIMPLE = "SIMPLE",
  TERRA_MYSTICA_POWER = "TERRA_MYSTICA_POWER", //
  TERRA_MYSTICA_CULTS = "TERRA_MYSTICA_CULTS", //
  SIMPLE_COMBINED = "SIMPLE_COMBINED" //
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
    };

const ResourceInput: React.FC<ResourceInputProps> = (props) => {
  const { resource, showDetails = true, onToggleShowDetails } = props;
  if (props.type === ResourceInputType.TERRA_MYSTICA_POWER) {
    const value = props.value as PowerValue;
    return <ResourceInputPower resource={resource} value={value} onChange={props.onChange} showDetails={showDetails} onToggleShowDetails={onToggleShowDetails!} />;
  }
  if (props.type === ResourceInputType.TERRA_MYSTICA_CULTS) {
    const value = props.value as CultsValue;
    return <ResourceInputCults resource={resource} value={value} onChange={props.onChange} showDetails={showDetails} onToggleShowDetails={onToggleShowDetails!} />;
  }
  if (props.type === ResourceInputType.SIMPLE_COMBINED) {
    const value = props.value as SimpleCombinedResourceChangeValue;
    return <ResourceInputSimpleCombined resource={resource} value={value} onChange={props.onChange} showDetails={showDetails} onToggleShowDetails={onToggleShowDetails!} />;
  }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
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
};

export default ResourceInput;
