import React from "react";
import "./FeaturePage.css";
import { FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { getVersion } from "./common/api";

const features = [
  {
    title: "User Management",
    description: [
      "Create a user with a name consisting of alphanumerical characters or underscores.",
      "Only the username is required—no password is needed.",
      "Afterwards you can log in with just your username to see your game plans in the dashboard."
    ]
  },
  {
    title: "Dashboard",
    description: [
      "Manage your games and plans easily.",
      "View all your plans, create new ones for every available game type, and delete old plans as needed."
    ]
  },
  {
    title: "Plan Details",
    description: [
      "By clicking on a plan in the dashboard, you can view and edit its details.",
      "Add, edit, move or delete plan stages with descriptions and resource changes.",
      "Plan stages can also be moved by drag and drop (the handle is the plan stage number). This only works on desktop devices though - for mobile devices use the move options in the stage menu.",
      "Plans are saved automatically as you make changes.",
      "The menu in the top left corner can be used to add new stages, show / hide inputs, clone the plan or delete it.",
      "Also every plan stage has a menu in the top right corner, where stages can be added, moved, cleared or deleted."
    ]
  },
  {
    title: "Resource Sum",
    description: [
      "On the bottom of a plan stage and on the bottom of the plan details you can see the summed up resources you have (per stage and in total).",
      "If the sum symbol turns red, the sum is below zero for some resource - this indicates that the stage is invalid.",
      "If any of the plan stages is invalid, the sum symbol on the bottom of the plan details page will turn red to indicate that the the plan is invalid at some point."
    ]
  },
  {
    title: "Resource Inputs - Simple",
    description: [
      "Add or remove numerical resources with a spinner input (use the buttons or type a number).",
    ]
  },
  {
    title: "Resource Inputs - Simple - Combined",
    description: [
      "Like simple inputs: add or remove numerical resources with a spinner input (use the buttons or type a number).",
      "In the combined input, multiple resources (of similar types) are combined to save space.",
      "Each resource type can be configured with a name and a color in the game configuration file."
    ]
  },
  {
    title: "Resource Inputs - Absolute",
    description: [
      "Set a numerical resources with a spinner input (use the buttons or type a number) or set to N/A.",
      "The values of this input type are not summed up, but instead the values will be used directly.",
      "If a stage has N/A for a resource, the value of the previous stage will be used (unchanged)."
    ]
  },
  {
    title: "Resource Inputs - One Time - Combined",
    description: [
      "Uses a tri-state button to set a value to yes (✓), no (✗) or N/A (-).",
      "The latest set value will be used directly instead of being summed up (like in absolute inputs).",
      "If a stage has N/A for a resource, the value of the previous stage will be used (unchanged)."
    ]
  },
  {
    title: "Resource Inputs - Power (Terra Mystica)",
    description: [
      "Use the power inputs to directly set the amount of power in each bowl. This will not be summed up, but instead the values will be used directly.",
      "To model gained, burned or used power, leave all power bowls set to 0 and use the spinners for the respective action below the power bowl inputs."
    ]
  },
  {
    title: "Resource Inputs - Cults (Terra Mystica)",
    description: [
      "Increase or decrease the level of your cults by using the spinners for the four cults \"Fire\", \"Water\", \"Earth\" and \"Air\".",
      "The colors of the cults indicate which cult is which.",
      "The levels of the cults will be summed up automatically and displayed in the sum fields.",
      "Power gain from cults is not modeled automatically."
    ]
  },
  {
    title: "Game Configurations",
    description: [
      "The configuration for a game can only be edited by directly editing the JSON configuration file in the backend.",
      "For a description and examples of the configuration file format, please refer to the GitHub repository."
    ]
  },
  {
    title: "GitHub Project",
    description: [
      "For a more detailed description of the features, the source code of this project and other info please refer to the GitHub repository.",
      { type: "link", url: "https://github.com/tfassbender/GamePlan", text: "GitHub: tfassbender/GamePlan" }
    ]
  }
];

const FeaturePage: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set());
  const [version, setVersion] = React.useState("");

  React.useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion(""));
  }, []);

  const toggleFeature = (idx: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className="feature-page-container">
      <div className="feature-page-header">
        <img src="/app/icons/logo.png" alt="GamePlan Logo" className="feature-page-logo" />
        <span className="feature-page-title">GamePlan - Features</span>
        <button className="feature-page-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </div>
      <div className="feature-page-content">
        <div className="feature-list">
          {features.map((feature, idx) => (
            <div className="feature-item" key={feature.title}>
              <button
                className="feature-item-header"
                onClick={() => toggleFeature(idx)}
                aria-expanded={expanded.has(idx)}
                aria-controls={`feature-desc-${idx}`}
              >
                <span>{feature.title}</span>
                {expanded.has(idx) ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expanded.has(idx) && (
                <div className="feature-item-desc" id={`feature-desc-${idx}`}>
                  {feature.description.map((paragraph, pIdx) => (
                    typeof paragraph === "string"
                      ? <p key={pIdx}>{paragraph}</p>
                      : paragraph.type === "link"
                        ? <p key={pIdx}><a href={paragraph.url} target="_blank" rel="noopener noreferrer">{paragraph.text}</a></p>
                        : null
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="feature-page-version-info">{version && `Version: ${version}`}</div>
    </div>
  );
};

export default FeaturePage;
