
"use client";

import { useEffect } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: "primary" | "danger" | "warning";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
  variant = "primary",
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "btn-danger"
      : variant === "warning"
        ? "btn-warning"
        : "luma-btn-primary";

  return (
    <div
      className="modal d-block luma-confirm-modal"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="modal-dialog modal-dialog-centered luma-confirm-dialog">
        <div className="modal-content border-0 shadow rounded-4 luma-confirm-content">
          {/* Header */}
          <div className="modal-header border-0 pb-0 luma-confirm-header">
            <div className="d-flex align-items-center gap-3">
              <div className="luma-confirm-icon">
                <FiAlertTriangle size={21} />
              </div>

              <h5
                className="modal-title fw-semibold mb-0"
                id="confirm-modal-title"
              >
                {title}
              </h5>
            </div>

            <button
              type="button"
              className="btn btn-link luma-modal-close"
              aria-label="Close modal"
              onClick={onCancel}
              disabled={isLoading}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body py-4 luma-confirm-body">
            <p className="text-secondary mb-0">{message}</p>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 pt-0 luma-confirm-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </button>

            <button
              type="button"
              className={`btn ${confirmButtonClass}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              )}

              {isLoading ? "Please wait..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
