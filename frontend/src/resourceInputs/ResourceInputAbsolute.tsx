import React from "react";
import "./ResourceInputAbsolute.css";

interface ResourceInputAbsoluteProps {
  resource: string;
  value: number | null;
  onChange: (value: number | null) => void;
  showDetails?: boolean;
  onToggleShowDetails?: () => void;
}

const ResourceInputAbsolute: React.FC<ResourceInputAbsoluteProps> = ({ resource, value, onChange, showDetails = true, onToggleShowDetails }) => {
  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? null : Number(e.target.value);
    onChange(newValue);
  };
  const handleDecrement = () => {
    if (value !== null) {
      onChange(value - 1);
    }
  };
  const handleIncrement = () => {
    if (value !== null) {
      onChange(value + 1);
    }
  };
  const handleToggleNA = () => {
    if (value === null) {
      onChange(0);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="resource-input resource-input-absolute">
      <div className="resource-input-row">
        <input
          type="checkbox"
          checked={showDetails}
          onChange={onToggleShowDetails}
          id={`show-absolute-details-${resource}`}
        />
        <label className="resource-input-label" htmlFor={`show-absolute-details-${resource}`}>{resource}</label>
        {!showDetails && (
          <span className="resource-input-hidden-value">{value === null ? "N/A" : value}</span>
        )}
      </div>
      {showDetails && (
        <>
          <button
            type="button"
            className="resource-input-btn resource-input-btn-decrement"
            onClick={handleDecrement}
            aria-label={`Decrease ${resource}`}
            disabled={value === null}
          >−</button>
          <input
            className="resource-input-spinner"
            type="number"
            value={value === null ? "" : value}
            onChange={handleNumChange}
            step={1}
            inputMode="numeric"
            disabled={value === null}
          />
          <button
            type="button"
            className="resource-input-btn resource-input-btn-increment"
            onClick={handleIncrement}
            aria-label={`Increase ${resource}`}
            disabled={value === null}
          >+</button>
          <button
            type="button"
            className={`resource-input-btn resource-input-btn-na${value === null ? " selected" : ""}`}
            onClick={handleToggleNA}
            aria-label={value === null ? `Unset N/A for ${resource}` : `Set N/A for ${resource}`}
          >N/A</button>
        </>
      )}
    </div>
  );
};

export default ResourceInputAbsolute;