"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { adminNavigation, isActivePath } from "@/components/shared/AdminNavigation";
import { useSidebar } from "./SidebarProvider";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={`admin-sidebar d-flex flex-column flex-shrink-0 border-end ${
          isCollapsed ? "admin-sidebar-collapsed" : ""
        } ${isMobileOpen ? "admin-sidebar-mobile-open" : ""}`}
      >
       <div className="admin-sidebar-brand">
  <Link href="/admin">
    <span className="admin-nav-label">LUMA &amp; CO.</span>
  </Link>

  <button
    type="button"
    className="admin-sidebar-close"
    onClick={closeMobile}
    aria-label="Close navigation menu"
  >
    <FiX size={22} aria-hidden="true" />
  </button>
</div>

        <nav className="nav flex-column gap-1 p-2 flex-grow-1">
          {adminNavigation.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
               
                aria-current={active ? "page" : undefined}
                  data-label={label}     
                className={`nav-link admin-nav-link d-flex align-items-center gap-3 rounded ${
                  active ? "active" : "text-body"
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="admin-nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-top">
          <Link
            href="/"
        
            data-label="Back to Shop" 
            className="nav-link admin-nav-link d-flex align-items-center gap-3 text-body"
          >
            <FiArrowLeft size={20} aria-hidden="true" />
            <span className="admin-nav-label">Back to Shop</span>
          </Link>
        </div>
      </aside>

      {isMobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay d-lg-none"
          aria-label="Close navigation menu"
          onClick={closeMobile}
        />
      )}
    </>
  );
}