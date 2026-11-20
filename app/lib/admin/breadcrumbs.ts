/** How each part of the URL is shown in the breadcrumb. */
const LABELS: Record<string, string> = {
  admin: "Administrator",
  products: "Products",
  categories: "Categories",
  brands: "Brands",
  settings: "Settings",
  orders: "Orders",
  customers: "Customers",
  reports: "Reports",
  edit: "Edit",
};

/**
 * "/admin/products/5/edit" -> Administrator / Products / 5 / Edit
 * "/admin"                 -> Administrator / Dashboard
 */
export function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    label: LABELS[segment] ?? segment,
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  // The admin home page is the dashboard.
  if (pathname === "/admin") {
    crumbs.push({ label: "Dashboard", href: "/admin" });
  }

  return crumbs;
}
