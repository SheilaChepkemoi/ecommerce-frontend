/**
 * SAMPLE sales data for the dashboard.
 *
 * Orders and payments aren't built yet, so these numbers are made up.
 * Everything sample lives in this one file: when the orders API exists,
 * replace these with API calls and the dashboard components stay the same.
 */

export type SalesRange = "7d" | "30d" | "12m";

export interface SalesPoint {
  /** x-axis label, e.g. "Mon", "Nov 3", "Jan" */
  label: string;
  /** KES */
  revenue: number;
  orders: number;
}

export interface SalesPeriod {
  label: string;
  points: SalesPoint[];
  /** The same numbers for the period before, for the "vs last period" deltas */
  previous: { revenue: number; orders: number; customers: number };
  newCustomers: number;
}

const days7: SalesPoint[] = [
  { label: "Mon", revenue: 48200, orders: 14 },
  { label: "Tue", revenue: 52600, orders: 16 },
  { label: "Wed", revenue: 45100, orders: 13 },
  { label: "Thu", revenue: 61300, orders: 18 },
  { label: "Fri", revenue: 78900, orders: 23 },
  { label: "Sat", revenue: 96400, orders: 29 },
  { label: "Sun", revenue: 83700, orders: 25 },
];

const days30Revenue = [
  41200, 45600, 39800, 52300, 61800, 74200, 68900, 43100, 47900, 42600,
  55100, 64300, 79800, 71200, 46300, 49800, 44100, 58600, 66900, 84300,
  76500, 48200, 52600, 45100, 61300, 78900, 96400, 83700, 57200, 63900,
];

const days30: SalesPoint[] = days30Revenue.map((revenue, index) => ({
  label: `Nov ${index + 1}`,
  revenue,
  orders: Math.round(revenue / 3300),
}));

const months12: SalesPoint[] = [
  { label: "Dec", revenue: 2140000, orders: 642 },
  { label: "Jan", revenue: 1380000, orders: 418 },
  { label: "Feb", revenue: 1290000, orders: 391 },
  { label: "Mar", revenue: 1460000, orders: 437 },
  { label: "Apr", revenue: 1520000, orders: 455 },
  { label: "May", revenue: 1610000, orders: 479 },
  { label: "Jun", revenue: 1570000, orders: 468 },
  { label: "Jul", revenue: 1690000, orders: 503 },
  { label: "Aug", revenue: 1820000, orders: 541 },
  { label: "Sep", revenue: 1760000, orders: 524 },
  { label: "Oct", revenue: 1910000, orders: 568 },
  { label: "Nov", revenue: 1865000, orders: 556 },
];

export const SALES: Record<SalesRange, SalesPeriod> = {
  "7d": {
    label: "Last 7 days",
    points: days7,
    previous: { revenue: 412000, orders: 126, customers: 41 },
    newCustomers: 47,
  },
  "30d": {
    label: "Last 30 days",
    points: days30,
    previous: { revenue: 1712000, orders: 521, customers: 166 },
    newCustomers: 182,
  },
  "12m": {
    label: "Last 12 months",
    points: months12,
    previous: { revenue: 17420000, orders: 5390, customers: 1480 },
    newCustomers: 1712,
  },
};

/** Orders in each stage of delivery, in pipeline order. */
export const ORDERS_BY_STATUS = [
  { label: "Pending payment", value: 18 },
  { label: "Processing", value: 24 },
  { label: "Out for delivery", value: 31 },
  { label: "Delivered", value: 142 },
  { label: "Cancelled", value: 7 },
];

/** Revenue per main category, largest first (KES). */
export const SALES_BY_CATEGORY = [
  { label: "Clothing", value: 892000 },
  { label: "Shoes", value: 451000 },
  { label: "Bags", value: 298000 },
  { label: "Accessories", value: 156000 },
  { label: "Beauty", value: 68000 },
];

export const TOP_PRODUCTS = [
  { name: "Cotton Midi Dress", sold: 86, revenue: 215000 },
  { name: "Linen Wide-Leg Trousers", sold: 64, revenue: 179200 },
  { name: "Leather Tote Bag", sold: 31, revenue: 201500 },
  { name: "Canvas Sneakers", sold: 58, revenue: 127600 },
  { name: "Ribbed Knit Top", sold: 72, revenue: 93600 },
];

export type OrderStatus = "Pending payment" | "Processing" | "Out for delivery" | "Delivered" | "Cancelled";

export const RECENT_ORDERS: {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  payment: "M-Pesa" | "Card";
  status: OrderStatus;
}[] = [
  { id: "LC-1048", customer: "Amina Wanjiru", date: "2026-11-19", items: 3, total: 8450, payment: "M-Pesa", status: "Pending payment" },
  { id: "LC-1047", customer: "Brian Otieno", date: "2026-11-19", items: 1, total: 2500, payment: "M-Pesa", status: "Processing" },
  { id: "LC-1046", customer: "Faith Njeri", date: "2026-11-18", items: 2, total: 6200, payment: "Card", status: "Out for delivery" },
  { id: "LC-1045", customer: "Kevin Mutua", date: "2026-11-18", items: 4, total: 11900, payment: "M-Pesa", status: "Delivered" },
  { id: "LC-1044", customer: "Grace Achieng", date: "2026-11-17", items: 1, total: 6500, payment: "Card", status: "Delivered" },
  { id: "LC-1043", customer: "Daniel Kiprop", date: "2026-11-17", items: 2, total: 3900, payment: "M-Pesa", status: "Cancelled" },
];
