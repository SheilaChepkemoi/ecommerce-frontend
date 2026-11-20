import { formatPrice } from "@/app/lib/format";
import type { ProductVariantResponse } from "@/app/types/products";


/** Read-only list of a product's sizes/colours. Editing happens on the edit page. */
export default function ProductVariants({
  variants,
}: {
  variants: ProductVariantResponse[];
}) {
  return (
    <div className="luma-card">
      <div className="p-4 pb-3">
        <h2 className="pe-section-title">Sizes, prices &amp; stock</h2>
        <p className="pe-section-subtitle">
          {variants.length} variant{variants.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="table-responsive px-2">
        <table className="table pe-variants mb-0">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Size</th>
              <th>Colour</th>
              <th className="text-end">Price</th>
              <th className="text-end">Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className={variant.active ? "" : "pe-row-inactive"}>
                <td><span className="luma-code">{variant.sku}</span></td>
                <td>{variant.size}</td>
                <td>{variant.colour}</td>
                <td className="text-end">{formatPrice(variant.price)}</td>
                <td className="text-end">
                  {!variant.inStock ? (
                    <span className="pv-pill is-bad">Sold out</span>
                  ) : variant.lowStock ? (
                    <span className="pv-pill is-warn">{variant.stockQuantity} · low</span>
                  ) : (
                    variant.stockQuantity
                  )}
                </td>
                <td>
                  <span className={`pv-pill ${variant.active ? "is-good" : "is-bad"}`}>
                    {variant.active ? "Available" : "Unavailable"}
                  </span>
                </td>
              </tr>
            ))}

            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-4">
                  No sizes yet. Add them on the edit page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
