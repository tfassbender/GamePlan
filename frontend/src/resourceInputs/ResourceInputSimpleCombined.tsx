import React from "react";
import "./ResourceInput.css";

interface SimpleCombinedValue {
  [key: string]: number;
}

interface ResourceInputSimpleCombinedProps {
  resource: string;
  value: { resources: Record<string, number>; colors?: Record<string, string> };
  onChange: (value: { resources: Record<string, number>; colors?: Record<string, string> }) => void;
  showDetails?: boolean;
  onToggleShowDetails?: () => void;
}

const ResourceInputSimpleCombined: React.FC<ResourceInputSimpleCombinedProps> = ({ resource, value, onChange, showDetails = true, onToggleShowDetails }) => {
  const { resources, colors = {} } = value;
  const handleChange = (field: string, newValue: number) => {
    onChange({ ...value, resources: { ...resources, [field]: newValue } });
  };

  return (
    <div className="resource-input resource-input-simple-combined">
      <div className="resource-input-simple-combined-row">
        <input
          type="checkbox"
          checked={showDetails}
          onChange={onToggleShowDetails}
          id={`show-simple-combined-details-${resource}`}
        />
        <label className="resource-input-label" htmlFor={`show-simple-combined-details-${resource}`}>{resource}</label>
        {!showDetails && (
          <span className="resource-input-hidden-value">
            {Object.entries(resources).map(([key, val]) => (
              <span key={key} style={{ color: colors[key] || undefined, fontWeight: 'bold' }}>{`${val >= 0 ? "+" : ""}${val} `}</span>
            ))}
          </span>
        )}
      </div>
      {showDetails && (
        <div className="resource-input-simple-combined-inputs" style={{ display: 'flex', gap: '1em', marginTop: '0.5em', marginLeft: '1em' }}>
          {Object.entries(resources).map(([key, val]) => (
            <div key={key} className="resource-input-simple-combined-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor={`input-${resource}-${key}`} style={{ color: colors[key] || undefined, fontWeight: 'bold', marginBottom: '0.2em' }}>{key}</label>
              <button
                type="button"
                className="resource-input-btn resource-input-btn-increment"
                onClick={() => handleChange(key, val + 1)}
                aria-label={`Increase ${key}`}
                style={{ marginBottom: '0.2em' }}
              >+</button>
              <input
                id={`input-${resource}-${key}`}
                type="number"
                value={val}
                onChange={e => handleChange(key, Number(e.target.value))}
                className="resource-input-simple-combined-spinner"
                style={{ width: '3em', textAlign: 'center', borderRadius: '1.5em', fontWeight: 'bold', borderWidth: '2px', borderStyle: 'solid', outline: 'none', background: colors[key] || undefined, borderColor: colors[key] || undefined }}
                step={1}
                inputMode="numeric"
              />
              <button
                type="button"
                className="resource-input-btn resource-input-btn-decrement"
                onClick={() => handleChange(key, val - 1)}
                aria-label={`Decrease ${key}`}
                style={{ marginTop: '0.2em' }}
              >−</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceInputSimpleCombined;
