import React from "react";
import './ResourceInputPower.css';

interface PowerValue {
  bowl1: number;
  bowl2: number;
  bowl3: number;
  gain: number;
  burn: number;
  use: number;
}

interface ResourceInputPowerProps {
  resource: string;
  value: PowerValue;
  onChange: (value: PowerValue) => void;
  showDetails: boolean;
  onToggleShowDetails: () => void;
}

const ResourceInputPower: React.FC<ResourceInputPowerProps> = ({ resource, value, onChange, showDetails, onToggleShowDetails }) => {
  const initialPowerValue = {
    bowl1: value?.bowl1 ?? 0,
    bowl2: value?.bowl2 ?? 0,
    bowl3: value?.bowl3 ?? 0,
    gain: value?.gain ?? 0,
    burn: value?.burn ?? 0,
    use: value?.use ?? 0
  };
  const [localPowerValue, setLocalPowerValue] = React.useState(initialPowerValue);
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
  // Spinner controls for gain, burn, use
  const handleSpinnerChange = (field: keyof PowerValue, delta: number) => {
    setLocalPowerValue(prev => {
      const newValue = { ...prev, [field]: Math.max(0, prev[field] + delta) };
      onChange(newValue);
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
          id={`show-power-details-${resource}`}
        />
        <label className="resource-input-label" htmlFor={`show-power-details-${resource}`}>{showDetails ? resource : `${resource} (hidden)`}</label>
      </div>
      {showDetails && (
        <>
          <div className="resource-input-tm-power-row">
            {/* Power bowls row */}
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
          {/* New line for gain, burn, use */}
          <div className="resource-input-tm-power-extra-row">
            {['gain', 'burn', 'use'].map(field => (
              <div key={field} className="resource-input-tm-power-group">
                <label className="resource-input-tm-power-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <div className="resource-input-tm-power-spinner-group">
                  <button
                    type="button"
                    className="resource-input-btn resource-input-btn-decrement"
                    onClick={() => handleSpinnerChange(field as keyof PowerValue, -1)}
                    aria-label={`Decrease ${field}`}
                  >−</button>
                  <input
                    className="resource-input-tm-power-oval resource-input-tm-power-spinner"
                    type="number"
                    name={field}
                    value={localPowerValue[field as keyof PowerValue]}
                    onChange={handlePowerChange}
                    onBlur={handlePowerBlur}
                    step={1}
                    inputMode="numeric"
                    min={0}
                    aria-label={field}
                  />
                  <button
                    type="button"
                    className="resource-input-btn resource-input-btn-increment"
                    onClick={() => handleSpinnerChange(field as keyof PowerValue, 1)}
                    aria-label={`Increase ${field}`}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ResourceInputPower;