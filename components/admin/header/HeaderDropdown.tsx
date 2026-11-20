"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface HeaderDropdownProps {
  /** Accessible name for the trigger button */
  label: string;
  /** Content of the trigger button (icon, avatar, text...) */
  trigger: ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  /** Receives a close() function so links inside can close the panel */
  children: (close: () => void) => ReactNode;
}

export default function HeaderDropdown({
  label,
  trigger,
  triggerClassName = "admin-icon-btn",
  panelClassName = "",
  children,
}: HeaderDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  // While open: click outside or Escape closes the panel
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="admin-dropdown" ref={rootRef}>
      <button
        type="button"
        className={triggerClassName}
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {trigger}
      </button>

      {open && (
        <div className={`admin-dropdown-panel ${panelClassName}`}>
          {children(close)}
        </div>
      )}
    </div>
  );
}