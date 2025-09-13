import React from "react";

export enum ResourceInputType {
  SIMPLE = "SIMPLE"
}

interface ResourceInputProps {
  resource: string;
  value: number;
  onChange: (value: number) => void;
  type?: ResourceInputType;
}

const ResourceInput: React.FC<ResourceInputProps> = ({ resource, value, onChange, type = ResourceInputType.SIMPLE }) => {
  // For now, only SIMPLE type is supported
  const handleDecrement = () => onChange(value - 1);
  const handleIncrement = () => onChange(value + 1);
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
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        step={1}
        inputMode="numeric"
        pattern="[0-9]*"
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
