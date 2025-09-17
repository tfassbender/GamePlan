import React from "react";
import "./ResourceInputCults.css";

interface CultsValue {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

interface ResourceInputCultsProps {
  resource: string;
  value: CultsValue;
  onChange: (value: CultsValue) => void;
  showDetails?: boolean;
  onToggleShowDetails?: () => void;
}

const ResourceInputCults: React.FC<ResourceInputCultsProps> = ({ resource, value, onChange, showDetails = true, onToggleShowDetails }) => {
  const handleChange = (field: keyof CultsValue, newValue: number) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="resource-input resource-input-cults">
      <div className="resource-input-cults-row">
        <input
          type="checkbox"
          checked={showDetails}
          onChange={onToggleShowDetails}
          id={`show-cults-details-${resource}`}
        />
        <label className="resource-input-label" htmlFor={`show-cults-details-${resource}`}>{resource}</label>
        {!showDetails && (
          <span className="resource-input-hidden-value">
            {`F:${value.fire >= 0 ? "+" : ""}${value.fire} W:${value.water >= 0 ? "+" : ""}${value.water} E:${value.earth >= 0 ? "+" : ""}${value.earth} A:${value.air >= 0 ? "+" : ""}${value.air}`}
          </span>
        )}
      </div>
      {showDetails && (
        <div className="resource-input-cults-inputs">
          {(['fire', 'water', 'earth', 'air'] as (keyof CultsValue)[]).map(field => (
            <div key={field} className="resource-input-cults-column">
              <button
                type="button"
                className="resource-input-btn resource-input-btn-increment"
                onClick={() => handleChange(field, value[field] + 1)}
                aria-label={`Increase ${field}`}
              >+</button>
              <input
                className={`resource-input-cults-spinner cults-${field}`}
                type="number"
                value={value[field]}
                onChange={e => handleChange(field, Number(e.target.value))}
                step={1}
                inputMode="numeric"
              />
              <button
                type="button"
                className="resource-input-btn resource-input-btn-decrement"
                onClick={() => handleChange(field, value[field] - 1)}
                aria-label={`Decrease ${field}`}
              >−</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceInputCults;
