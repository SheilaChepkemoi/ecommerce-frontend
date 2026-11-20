"use client";

import Link from "next/link";
import { FiPackage, FiPlus, FiTag, FiUsers } from "react-icons/fi";
import HeaderDropdown from "./HeaderDropdown";

// Each link opens the list page with ?create=1.
// The page reads that param and opens its "new" modal (see the usage note).
const actions = [
  { label: "New product", href: "/admin/products?create=1", icon: FiPackage },
  { label: "New category", href: "/admin/categories?create=1", icon: FiTag },
  { label: "New brand", href: "/admin/brands?create=1", icon: FiUsers },
] as const;

export default function QuickCreateMenu() {
  return (
    <HeaderDropdown
      label="Create new"
      triggerClassName="admin-create-btn"
      panelClassName="admin-create-menu"
      trigger={
        <>
          <FiPlus size={18} aria-hidden="true" />
          <span className="d-none d-md-inline">Create</span>
        </>
      }
    >
      {(close) =>
        actions.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="admin-dropdown-item" onClick={close}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </Link>
        ))
      }
    </HeaderDropdown>
  );
}