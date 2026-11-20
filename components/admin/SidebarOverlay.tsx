// components/admin/SidebarOverlay.tsx
"use client";

import { useSidebar } from "./SidebarProvider";

export default function SidebarOverlay() {
  const { isMobileOpen, closeMobile } = useSidebar();
  if (!isMobileOpen) return null;

  return (
    <button
      type="button"
      className="admin-sidebar-overlay d-lg-none"
      aria-label="Close navigation menu"
      onClick={closeMobile}
    />
  );
}