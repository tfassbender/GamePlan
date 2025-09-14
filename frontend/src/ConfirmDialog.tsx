
import React from "react";
import "./App.css";

export enum ConfirmDialogType {
  DEFAULT = "DEFAULT",
  DANGER = "DANGER"
}

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: ConfirmDialogType;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel, type = ConfirmDialogType.DEFAULT }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        {title && (
          <h3 className={`modal-title${type === ConfirmDialogType.DANGER ? " modal-title-danger" : ""}`}>{title}</h3>
        )}
        <div className="modal-message">{message}</div>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

