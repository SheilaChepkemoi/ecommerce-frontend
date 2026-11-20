"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiExternalLink, FiMenu } from "react-icons/fi";
import { getBreadcrumbs } from "@/app/lib/admin/breadcrumbs";
import { useSidebar } from "./SidebarProvider";
import NotificationsMenu from "./header/NotificationsMenu";
import ProfileMenu from "./header/ProfileMenu";
import QuickCreateMenu from "./header/QuickCreateMenu";
import SearchPalette from "./header/SearchPalette";
import ThemeToggle from "./../shared/ThemeToggle";

export default function AdminHeader() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile } = useSidebar();

  const crumbs = getBreadcrumbs(pathname);
  const title = crumbs[crumbs.length - 1]?.label;

  return (
    <header className="admin-header d-flex align-items-center justify-content-between gap-3 px-3 px-md-4">
      {/* ---------- Left: navigation context ---------- */}
      <div className="admin-header-left d-flex align-items-center gap-3">
        {/* Desktop: collapse / expand */}
        <button
          type="button"
          className="admin-toggle d-none d-lg-inline-flex"
          onClick={toggleCollapsed}
          aria-controls="admin-sidebar"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiMenu size={20} aria-hidden="true" />
        </button>

        {/* Mobile: open drawer */}
        <button
          type="button"
          className="admin-toggle d-inline-flex d-lg-none"
          onClick={toggleMobile}
          aria-controls="admin-sidebar"
          aria-expanded={isMobileOpen}
          aria-label="Open navigation menu"
        >
          <FiMenu size={20} aria-hidden="true" />
        </button>

        {/* md and up: full breadcrumb */}
        <nav aria-label="Breadcrumb" className="admin-breadcrumb d-none d-md-block">
          <ol className="breadcrumb">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li
                  key={`${i}-${crumb.href}`}
                  className={`breadcrumb-item ${isLast ? "active" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {isLast ? crumb.label : <Link href={crumb.href}>{crumb.label}</Link>}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Phones: just the current page name */}
        <span className="fw-semibold text-truncate d-md-none">{title}</span>
      </div>

      {/* ---------- Right: tools ---------- */}
      <div className="admin-header-actions">
        <SearchPalette />

        {/* Hidden on very small phones to save space */}
        <div className="d-none d-sm-block">
          <QuickCreateMenu />
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener"
          className="admin-header-link d-none d-lg-inline-flex"
        >
          View store <FiExternalLink size={14} aria-hidden="true" />
        </Link>

        <ThemeToggle className="admin-icon-btn"/>
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}