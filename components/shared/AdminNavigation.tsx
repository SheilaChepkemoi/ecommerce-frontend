import { FiGrid, FiPackage, FiTag, FiUsers, FiSettings, FiShoppingBag, FiFileText, FiAward, FiLayers, FiBarChart2 } from "react-icons/fi";

export const adminNavigation = [
  { label: "Dashboard", href: "/admin", icon: FiGrid },
  { label: "Products", href: "/admin/products", icon: FiPackage },
  { label: "Categories", href: "/admin/categories", icon: FiLayers  },
  { label: "Brands", href: "/admin/brands", icon: FiAward  },
  { label: "Orders", href: "/admin/orders", icon: FiShoppingBag  },
  { label: "Customers", href: "/admin/customers", icon: FiUsers },
  { label: "Reports", href: "/admin/reports", icon: FiBarChart2  },
  { label: "Settings", href: "/admin/settings", icon: FiSettings },
] as const;

export function isActivePath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}