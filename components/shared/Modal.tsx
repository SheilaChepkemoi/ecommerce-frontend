
"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import Button from "./Button";

interface BaseModalProps {
  show: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  size?: "sm" | "lg" | "xl";
  showFooter?: boolean;
  submitVariant?: "primary" | "secondary" | "danger" | "outline";
  loadingText?: string;
}

export default function Modal({
  show,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  submitDisabled = false,
  size,
  showFooter = true,
  submitVariant = "primary",
  loadingText = "Saving...",
}: BaseModalProps) {
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("luma-modal-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("luma-modal-open");
    };
  }, [show, onClose, isSubmitting]);

  if (!show) return null;

  const modalSize = size ? `modal-${size}` : "";

  return (
    <div
      className="modal d-block luma-modal-backdrop"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`modal-dialog modal-dialog-centered ${modalSize}`}
        role="document"
      >
        <div className="modal-content luma-modal-content">
          <div className="modal-header luma-modal-header">
            <h5 className="modal-title fw-semibold mb-0">
              {title}
            </h5>

            <button
              type="button"
              className="btn btn-link luma-modal-close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <FiX size={21} />
            </button>
          </div>

          <div className="modal-body luma-modal-body">
            {children}
          </div>

          {showFooter && (
            <div className="modal-footer luma-modal-footer">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>

              {onSubmit && (
                <Button
                  variant={submitVariant}
                  onClick={onSubmit}
                  loading={isSubmitting}
                  loadingText={loadingText}
                  disabled={submitDisabled || isSubmitting}
                >
                  {submitLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
