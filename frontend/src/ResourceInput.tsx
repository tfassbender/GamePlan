import React from "react";

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
    const initialPowerValue = (typeof value === "object" && value !== null)
      ? value as { bowl1: number; bowl2: number; bowl3: number }
      : { bowl1: 0, bowl2: 0, bowl3: 0 };
    const [localPowerValue, setLocalPowerValue] = React.useState(initialPowerValue);
    // Sync local state with prop changes
    React.useEffect(() => {
      setLocalPowerValue(initialPowerValue);
    }, [value]);
    const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLocalPowerValue(prev => ({ ...prev, [name]: Number(value) }));
    };
    const handlePowerBlur = () => {
      onChange(localPowerValue);
    };
    return (
      <div className="resource-input">
        <label className="resource-input-label">{resource}</label>
        <div style={{ display: 'flex', gap: '0.5em' }}>
          <input
            key="bowl1"
            className="resource-input-tm-power-oval"
            type="number"
            name="bowl1"
            value={localPowerValue.bowl1}
            onChange={handlePowerChange}
            onBlur={handlePowerBlur}
            min={0}
            aria-label="Power Bowl 1"
          />
          <input
            key="bowl2"
            className="resource-input-tm-power-oval"
            type="number"
            name="bowl2"
            value={localPowerValue.bowl2}
            onChange={handlePowerChange}
            onBlur={handlePowerBlur}
            min={0}
            aria-label="Power Bowl 2"
          />
          <input
            key="bowl3"
            className="resource-input-tm-power-oval"
            type="number"
            name="bowl3"
            value={localPowerValue.bowl3}
            onChange={handlePowerChange}
            onBlur={handlePowerBlur}
            min={0}
            aria-label="Power Bowl 3"
          />
        </div>
      </div>
    );
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
