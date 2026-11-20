"use client";

import { useEffect } from "react";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

import Button from "@/components/shared/Button";

interface FilterDrawerProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}

export default function FilterDrawer({
  isOpen,
  title = "Filters",
  children,
  isLoading = false,
  onClose,
  onApply,
  onReset,
}: FilterDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="filter-drawer-backdrop"
      onClick={onClose}
    >
      <aside
        className="filter-drawer d-flex flex-column"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-4 border-bottom flex-shrink-0">
          <h5 className="mb-0 fw-semibold">
            {title}
          </h5>

          <button
            type="button"
            className="btn p-1 border-0 text-secondary"
            onClick={onClose}
            aria-label="Close filters"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-grow-1 overflow-auto p-4">
          {children}
        </div>

        {/* Actions */}
     <div className="d-flex align-items-center gap-2 p-3 border-top  flex-shrink-0">
  <Button
    variant="secondary"
    className="luma-btn-secondary flex-fill"
    onClick={onReset}

  >
    <FiRefreshCw size={15} />
    Clear all
  </Button>

  <Button
    variant="primary"
    className="luma-btn-primary flex-fill"
    onClick={onApply}
      loading={isLoading}
  >
    <FiSearch size={15} />
    Apply Filters
  </Button>
</div>
      </aside>
    </div>
  );
}