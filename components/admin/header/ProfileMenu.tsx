"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLogOut, FiSettings } from "react-icons/fi";
import HeaderDropdown from "./HeaderDropdown";

// SAMPLE USER: replace with the logged-in user from your auth.
// A good way: fetch the user in app/admin/layout.tsx (server side)
// and pass it down as a prop.
const user = {
  name: "Admin User",
  email: "admin@lumaandco.com",
  role: "Administrator",
};

const initials = user.name
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function ProfileMenu() {
  const router = useRouter();

  async function handleLogout() {
    // TODO: replace with your real logout (call your Java API / clear the session cookie)
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <HeaderDropdown
      label="Account menu"
      triggerClassName="admin-profile-btn"
      panelClassName="admin-profile-menu"
      trigger={
        <>
          <span className="admin-profile-avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="admin-profile-text d-none d-xl-flex">
            <span className="admin-profile-name">{user.name}</span>
            <span className="admin-profile-role">{user.role}</span>
          </span>
        </>
      }
    >
      {(close) => (
        <>
          <div className="admin-profile-summary">
            <span className="admin-profile-name">{user.name}</span>
            <span className="admin-profile-email">{user.email}</span>
            <span className="admin-profile-role">{user.role}</span>
          </div>

          <Link href="/admin/settings" className="admin-dropdown-item" onClick={close}>
            <FiSettings size={16} aria-hidden="true" />
            Settings
          </Link>

          <div className="admin-dropdown-divider" />

          <button
            type="button"
            className="admin-dropdown-item danger"
            onClick={() => {
              close();
              handleLogout();
            }}
          >
            <FiLogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </>
      )}
    </HeaderDropdown>
  );
}