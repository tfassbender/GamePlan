import React from "react";
import "./ResourceInput.css";
import "./ResourceInputSimpleCombined.css";
import { isColorDark } from "../common/colorUtils";

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
        <label className="resource-input-label resource-input-simple-combined-label" htmlFor={`show-simple-combined-details-${resource}`}>{resource}</label>
        {!showDetails && (
          <span className="resource-input-hidden-value">
            {Object.entries(resources).map(([key, val]) => {
              const bgColor = colors[key] || undefined;
              let textColor = undefined;
              if (bgColor && /^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
                textColor = isColorDark(bgColor) ? '#fff' : '#222';
              }
              return (
                <span key={key} className="resource-input-simple-combined-value-bg" style={{ color: textColor, fontWeight: 'bold', background: bgColor }}>{`${val >= 0 ? "+" : ""}${val} `}</span>
              );
            })}
          </span>
        )}
      </div>
      {showDetails && (
        <div className="resource-input-simple-combined-inputs">
          {Object.entries(resources).map(([key, val]) => (
            <div key={key} className="resource-input-simple-combined-column">
              <label
                htmlFor={`input-${resource}-${key}`}
                className="resource-input-simple-combined-resource-type-label"
                style={{ color: (() => {
                  const bgColor = colors[key] || undefined;
                  if (bgColor && /^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
                    return isColorDark(bgColor) ? '#fff' : '#222';
                  }
                  return undefined;
                })(), background: colors[key] || undefined }}
                title={key}
              >
                {key}
              </label>
              <button
                type="button"
                className="resource-input-btn resource-input-btn-increment"
                onClick={() => handleChange(key, val + 1)}
                aria-label={`Increase ${key}`}
              >+</button>
              <input
                id={`input-${resource}-${key}`}
                type="number"
                value={val}
                onChange={e => handleChange(key, Number(e.target.value))}
                className="resource-input-simple-combined-spinner"
                style={{ background: colors[key] || undefined, borderColor: colors[key] || undefined, color: (() => {
                  const bgColor = colors[key] || undefined;
                  if (bgColor && /^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
                    return isColorDark(bgColor) ? '#fff' : '#222';
                  }
                  return undefined;
                })() }}
                step={1}
                inputMode="numeric"
              />
              <button
                type="button"
                className="resource-input-btn resource-input-btn-decrement"
                onClick={() => handleChange(key, val - 1)}
                aria-label={`Decrease ${key}`}
              >−</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceInputSimpleCombined;
