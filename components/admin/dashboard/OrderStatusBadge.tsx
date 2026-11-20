import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiXCircle } from "react-icons/fi";

import type { OrderStatus } from "@/app/lib/admin/dashboardSampleData";

// Each status: an icon + a colour class. The label is always written too,
// so the status never relies on colour alone.
const STYLES: Record<OrderStatus, { icon: typeof FiClock; className: string }> = {
  "Pending payment": { icon: FiClock, className: "is-warning" },
  Processing: { icon: FiPackage, className: "is-neutral" },
  "Out for delivery": { icon: FiTruck, className: "is-neutral" },
  Delivered: { icon: FiCheckCircle, className: "is-good" },
  Cancelled: { icon: FiXCircle, className: "is-critical" },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { icon: Icon, className } = STYLES[status];

  return (
    <span className={`dash-order-status ${className}`}>
      <Icon size={13} aria-hidden="true" />
      {status}
    </span>
  );
}
