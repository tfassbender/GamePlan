import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faMinus } from "@fortawesome/free-solid-svg-icons";
import { isColorDark } from "../common/colorUtils";
import "./ResourceInputOneTimeCombined.css";

export interface OneTimeCombinedProps {
  resources: Record<string, boolean | null>;
  colors?: Record<string, string>;
  onChange: (newValue: { resources: Record<string, boolean | null>; colors?: Record<string, string> }) => void;
  showDetails: boolean;
  onToggleShowDetails: () => void;
  resource: string;
}

const states: Array<{ value: boolean | null; label: string; icon: React.ReactNode; aria: string }> = [
  { value: true, label: "Yes", icon: <FontAwesomeIcon icon={faCheck} />, aria: "Yes" },
  { value: false, label: "No", icon: <FontAwesomeIcon icon={faTimes} />, aria: "No" },
  { value: null, label: "Not set", icon: <FontAwesomeIcon icon={faMinus} />, aria: "Not set" },
];

const getIconForValue = (value: boolean | null) => {
  if (value === true) return faCheck;
  if (value === false) return faTimes;
  return faMinus;
};

const getAriaForValue = (value: boolean | null) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not set";
};

const ResourceInputOneTimeCombined: React.FC<OneTimeCombinedProps> = ({ resources, colors = {}, onChange, showDetails, onToggleShowDetails, resource }) => {
  const handleSetState = (key: string, value: boolean | null) => {
    onChange({
      resources: { ...resources, [key]: value },
      colors,
    });
  };

  return (
    <div className="resource-input-one-time-combined">
      <div className="resource-input-row">
        <input
          type="checkbox"
          checked={showDetails}
          onChange={onToggleShowDetails}
          id={`show-one-time-combined-details-${resource}`}
        />
        <label className="resource-input-label" htmlFor={`show-one-time-combined-details-${resource}`}>{resource}</label>
      </div>
      {showDetails ? (
        <table className="resource-input-one-time-combined-table">
          <tbody>
            {Object.keys(resources).map(key => {
              const color = colors[key];
              let textColor: string | undefined = undefined;
              if (color && /^#([0-9A-F]{3}){1,2}$/i.test(color)) {
                textColor = isColorDark(color) ? '#fff' : '#222';
              }
              const current = resources[key];
              return (
                <tr key={key} className="one-time-combined-resource-row">
                  <td className="one-time-combined-resource-label-td">
                    <span
                      className="one-time-combined-resource-label"
                      style={{ background: color, color: textColor }}
                    >
                      {key}
                    </span>
                  </td>
                  <td className="one-time-combined-btn-group-td">
                    <div className="one-time-combined-btn-group">
                      {states.map(({ value, icon, aria }, idx) => (
                        <button
                          key={value === null ? "null" : value.toString()}
                          className={`one-time-combined-btn${current === value ? " active" : ""}`}
                          onClick={() => handleSetState(key, value)}
                          aria-label={aria}
                          type="button"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="resource-input-one-time-combined-hint-row">
          {Object.keys(resources).map(key => {
            const color = colors[key] || "#444";
            let textColor: string | undefined = undefined;
            if (color && /^#([0-9A-F]{3}){1,2}$/i.test(color)) {
              textColor = isColorDark(color) ? '#fff' : '#222';
            }
            const value = resources[key];
            return (
              <span
                key={key}
                className="one-time-combined-hint-icon"
                style={{ background: color, color: textColor }}
                aria-label={getAriaForValue(value)}
                title={key}
              >
                <FontAwesomeIcon icon={getIconForValue(value)} />
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourceInputOneTimeCombined;
