"use client";

import { useState } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";

import BarList from "@/components/admin/dashboard/BarList";
import OrderStatusBadge from "@/components/admin/dashboard/OrderStatusBadge";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import StatTile from "@/components/admin/dashboard/StatTile";

import { useCatalogueStats } from "@/app/hooks/useCatalogueStats";
import { formatCompact, formatKesCompact, formatPrice } from "@/app/lib/format";
import {
  ORDERS_BY_STATUS,
  RECENT_ORDERS,
  SALES,
  SALES_BY_CATEGORY,
  TOP_PRODUCTS,
  type SalesRange,
} from "@/app/lib/admin/dashboardSampleData";

const RANGES: { value: SalesRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
];

/** % change from `previous` to `current`, e.g. 120 vs 100 -> 20 */
const percentChange = (current: number, previous: number) =>
  previous === 0 ? 0 : ((current - previous) / previous) * 100;

/** A count that may still be loading */
const showCount = (value: number | undefined) => (value === undefined ? "…" : formatCompact(value));

export default function AdminDashboardPage() {
  // ==================================================
  // DATA
  // ==================================================

  const [range, setRange] = useState<SalesRange>("30d");

  // Sales (SAMPLE data until orders are built)
  const period = SALES[range];
  const revenue = period.points.reduce((sum, point) => sum + point.revenue, 0);
  const orders = period.points.reduce((sum, point) => sum + point.orders, 0);
  const averageOrder = orders === 0 ? 0 : revenue / orders;
  const previousAverage = period.previous.revenue / period.previous.orders;

  // Catalogue (REAL data from the API)
  const catalogue = useCatalogueStats();

  const inStock =
    catalogue.activeProducts !== undefined && catalogue.outOfStock !== undefined
      ? catalogue.activeProducts - catalogue.outOfStock
      : undefined;
  const inStockPercent =
    inStock !== undefined && catalogue.activeProducts ? (inStock / catalogue.activeProducts) * 100 : 0;

  // ==================================================
  // PAGE UI
  // ==================================================

  return (
    <div className="luma-page">
      {/* Header: title + the time range for every sales figure */}
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h1 className="h4 fw-semibold mb-1">Overview</h1>
          <p className="text-secondary mb-0">How Luma &amp; Co. is doing, {period.label.toLowerCase()}.</p>
        </div>

        <div className="btn-group dash-range" role="group" aria-label="Time range">
          {RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn btn-sm ${range === option.value ? "is-selected" : ""}`}
              aria-pressed={range === option.value}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-sample-note mb-4">
        <FiInfo aria-hidden="true" />
        Sales, orders and customers are <strong>sample data</strong> until checkout is built. The
        catalogue and low-stock figures are live.
      </div>

      {/* Row 1: headline numbers */}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-3">
          <StatTile
            label="Revenue"
            value={formatKesCompact(revenue)}
            changePercent={percentChange(revenue, period.previous.revenue)}
            trend={period.points.map((point) => point.revenue)}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatTile
            label="Orders"
            value={formatCompact(orders)}
            changePercent={percentChange(orders, period.previous.orders)}
            trend={period.points.map((point) => point.orders)}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatTile
            label="Average order value"
            value={formatKesCompact(Math.round(averageOrder))}
            changePercent={percentChange(averageOrder, previousAverage)}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatTile
            label="New customers"
            value={formatCompact(period.newCustomers)}
            changePercent={percentChange(period.newCustomers, period.previous.customers)}
          />
        </div>
      </div>

      {/* Row 2: revenue over time + where orders are */}
      <div className="row g-3 mb-3">
        <div className="col-xl-8">
          <section className="luma-card dash-card h-100">
            <header className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Revenue</h2>
                <p className="dash-card-subtitle">KES per {range === "12m" ? "month" : "day"}</p>
              </div>
              <div className="dash-card-figure">{formatPrice(revenue)}</div>
            </header>
            <RevenueChart points={period.points} />
          </section>
        </div>

        <div className="col-xl-4">
          <section className="luma-card dash-card h-100">
            <header className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Orders by status</h2>
                <p className="dash-card-subtitle">From payment to delivery</p>
              </div>
            </header>
            <BarList items={ORDERS_BY_STATUS} />
          </section>
        </div>
      </div>

      {/* Row 3: what sells + catalogue health */}
      <div className="row g-3 mb-3">
        <div className="col-lg-6 col-xl-4">
          <section className="luma-card dash-card h-100">
            <header className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Sales by category</h2>
                <p className="dash-card-subtitle">Revenue, largest first</p>
              </div>
            </header>
            <BarList items={SALES_BY_CATEGORY} formatValue={formatKesCompact} />
          </section>
        </div>

        <div className="col-lg-6 col-xl-4">
          <section className="luma-card dash-card h-100">
            <header className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Top products</h2>
                <p className="dash-card-subtitle">By revenue</p>
              </div>
            </header>
            <table className="table dash-table mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-end">Sold</th>
                  <th className="text-end">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((product) => (
                  <tr key={product.name}>
                    <td>{product.name}</td>
                    <td className="text-end">{product.sold}</td>
                    <td className="text-end">{formatKesCompact(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="col-xl-4">
          <section className="luma-card dash-card h-100">
            <header className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Catalogue</h2>
                <p className="dash-card-subtitle">Live from your store</p>
              </div>
            </header>

            {/* Meter: share of active products that can be bought now */}
            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span>Active products in stock</span>
                <span className="fw-semibold">{Math.round(inStockPercent)}%</span>
              </div>
              <div className="dash-bars-track">
                <div className="dash-bars-fill" style={{ width: `${inStockPercent}%` }} />
              </div>
            </div>

            <dl className="dash-facts mb-0">
              <div>
                <dt>Active products</dt>
                <dd>
                  <Link href="/admin/products">{showCount(catalogue.activeProducts)}</Link>
                </dd>
              </div>
              <div>
                <dt>Out of stock</dt>
                <dd>{showCount(catalogue.outOfStock)}</dd>
              </div>
              <div>
                <dt>Low-stock sizes</dt>
                <dd>{showCount(catalogue.isLoadingLowStock ? undefined : catalogue.lowStockVariants.length)}</dd>
              </div>
              <div>
                <dt>Brands</dt>
                <dd>
                  <Link href="/admin/brands">{showCount(catalogue.brands)}</Link>
                </dd>
              </div>
              <div>
                <dt>Categories</dt>
                <dd>
                  <Link href="/admin/categories">{showCount(catalogue.categories)}</Link>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Row 4: latest orders + what needs restocking */}
      <div className="row g-3">
        <div className="col-xl-8">
          <section className="luma-card dash-card h-100">
            <header className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Recent orders</h2>
                <p className="dash-card-subtitle">The latest six</p>
              </div>
            </header>
            <div className="table-responsive">
              <table className="table dash-table mb-0">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="luma-code">{order.id}</span>
                      </td>
                      <td>
                        {order.customer}
                        <div className="small text-secondary">{order.items} item(s)</div>
                      </td>
                      <td>{order.date}</td>
                      <td>{order.payment}</td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="text-end fw-medium">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-xl-4">
          <section className="luma-card dash-card h-100">
            <header className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Low stock</h2>
                <p className="dash-card-subtitle">Sizes at or below their alert level</p>
              </div>
            </header>

            {catalogue.isLoadingLowStock ? (
              <p className="text-secondary small mb-0">Loading…</p>
            ) : catalogue.lowStockVariants.length === 0 ? (
              <p className="text-secondary small mb-0">Everything is well stocked.</p>
            ) : (
              <ul className="dash-stock-list">
                {catalogue.lowStockVariants.slice(0, 6).map((variant) => (
                  <li key={variant.id}>
                    <Link href={`/admin/products/${variant.productId}/edit`}>
                      <div className="fw-medium">{variant.productName}</div>
                      <div className="small text-secondary">
                        {[variant.size, variant.colour].filter(Boolean).join(" / ")}{" "}
                        <span className="luma-code">{variant.sku}</span>
                      </div>
                    </Link>
                    <span className="dash-order-status is-warning">
                      <FiAlertTriangle size={13} aria-hidden="true" />
                      {variant.stockQuantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
