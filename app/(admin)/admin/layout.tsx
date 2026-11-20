
import { cookies } from "next/headers";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { SIDEBAR_COOKIE, SidebarProvider } from "@/components/admin/SidebarProvider";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies(); // on Next 14, remove `await`
  const defaultCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <div className="admin-layout d-flex">
        <AdminSidebar />

        <div className="admin-content d-flex flex-column flex-grow-1">
          <AdminHeader />
          <main className="admin-main flex-grow-1 p-3 p-md-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}