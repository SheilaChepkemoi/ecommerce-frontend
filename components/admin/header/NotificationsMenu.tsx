"use client";

import Link from "next/link";
import { FiBell } from "react-icons/fi";
import HeaderDropdown from "./HeaderDropdown";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  href: string;
  unread: boolean;
}

// SAMPLE DATA: replace with a fetch to your Java API,
// e.g. GET /api/admin/notifications
const notifications: Notification[] = [
  {
    id: 1,
    title: "Low stock",
    message: "Leather Tote is down to 3 units.",
    time: "10 min ago",
    href: "/admin/products",
    unread: true,
  },
  {
    id: 2,
    title: "Out of stock",
    message: "Classic Sneakers (size 42) sold out.",
    time: "2 hours ago",
    href: "/admin/products",
    unread: true,
  },
  {
    id: 3,
    title: "Brand added",
    message: "Primark was added to your brands.",
    time: "Yesterday",
    href: "/admin/brands",
    unread: false,
  },
];

export default function NotificationsMenu() {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <HeaderDropdown
      label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      panelClassName="admin-notifications"
      trigger={
        <>
          <FiBell size={18} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="admin-icon-badge" aria-hidden="true">
              {unreadCount}
            </span>
          )}
        </>
      }
    >
      {(close) => (
        <>
          <div className="admin-panel-header">Notifications</div>

          {notifications.length === 0 ? (
            <p className="admin-panel-empty">You’re all caught up.</p>
          ) : (
            <ul className="admin-notification-list">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    className={`admin-notification ${n.unread ? "unread" : ""}`}
                    onClick={close}
                  >
                    <span className="admin-notification-dot" aria-hidden="true" />
                    <span className="admin-notification-body">
                      <span className="admin-notification-title">{n.title}</span>
                      <span className="admin-notification-message">{n.message}</span>
                      <span className="admin-notification-time">{n.time}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </HeaderDropdown>
  );
}