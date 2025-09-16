import React from "react";
import ResourceInputPower from "./ResourceInputPower";

export enum ResourceInputType {
  SIMPLE = "SIMPLE",
  TM_POWER = "TM_POWER" // power resource in Terra Mystica
}

interface ResourceInputProps {
  resource: string;
  value: number | { bowl1: number; bowl2: number; bowl3: number };
  onChange: (value: number | { bowl1: number; bowl2: number; bowl3: number }) => void;
  type?: ResourceInputType;
}

const ResourceInput: React.FC<ResourceInputProps> = ({ resource, value, onChange, type = ResourceInputType.SIMPLE }) => {
  if (type === ResourceInputType.TM_POWER) {
    // Ensure value is always an object for TM_POWER
    const powerValue = (typeof value === "object" && value !== null)
      ? {
          bowl1: value.bowl1 ?? 0,
          bowl2: value.bowl2 ?? 0,
          bowl3: value.bowl3 ?? 0,
          gain: (value as any).gain ?? 0,
          burn: (value as any).burn ?? 0,
          use: (value as any).use ?? 0
        }
      : { bowl1: 0, bowl2: 0, bowl3: 0, gain: 0, burn: 0, use: 0 };
    return <ResourceInputPower resource={resource} value={powerValue} onChange={onChange} />;
  }
  // Only allow arithmetic for numbers
  const numValue = typeof value === "number" ? value : 0;
  const [localNumValue, setLocalNumValue] = React.useState(numValue);
  React.useEffect(() => {
    setLocalNumValue(numValue);
  }, [value]);
  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalNumValue(Number(e.target.value));
  };
  const handleNumBlur = () => {
    onChange(localNumValue);
  };
  const handleDecrement = () => {
    setLocalNumValue(v => {
      const newValue = v - 1;
      onChange(newValue);
      return newValue;
    });
  };
  const handleIncrement = () => {
    setLocalNumValue(v => {
      const newValue = v + 1;
      onChange(newValue);
      return newValue;
    });
  };
  return (
    <div className="resource-input">
      <label className="resource-input-label">{resource}</label>
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
    </div>
  );
};

export default ResourceInput;
