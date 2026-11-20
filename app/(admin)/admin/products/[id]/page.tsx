"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiEdit2, FiImage, FiPackage } from "react-icons/fi";

import { useProduct } from "@/app/hooks/useProduct";
import { getErrorMessage } from "@/app/lib/getErrorMessage";
import { formatPrice } from "@/app/lib/format";
import { getImageUrl } from "@/app/lib/imageUrl";
import ProductVariants from "@/components/admin/products/ProductVariants";

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const { data: product, isLoading, isError, error } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="luma-card p-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="text-secondary mb-0">Loading product...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="luma-card p-5 text-center">
        <FiPackage size={32} className="text-secondary mb-3" />
        <h5>Could not load this product</h5>
        <p className="text-secondary">
          {isError ? getErrorMessage(error) : "It may have been removed, or the link is wrong."}
        </p>
        <Link href="/admin/products" className="luma-btn luma-btn-secondary">
          <FiArrowLeft className="me-2" />
          Back to Products
        </Link>
      </div>
    );
  }

  // Main image first, then the rest in display order
  const images = [...(product.images ?? [])].sort(
    (a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder
  );

  const activeVariants = (product.variants ?? []).filter((variant) => variant.active);
  const totalStock = activeVariants.reduce((sum, variant) => sum + variant.stockQuantity, 0);

  return (
    <div>
      {/* Header */}
      <div className="luma-page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <Link href="/admin/products" className="luma-btn luma-btn-secondary" title="Back to products">
            <FiArrowLeft />
          </Link>
          <div>
            <h1 className="h4 mb-0 fw-semibold">{product.name}</h1>
            <span className="text-secondary small">
              <span className="luma-code">{product.sku}</span> · {product.brandName} ·{" "}
              {product.categoryName}
              {product.subcategoryName && ` › ${product.subcategoryName}`}
            </span>
          </div>
        </div>

        <Link href={`/admin/products/${product.id}/edit`} className="luma-btn luma-btn-primary">
          <FiEdit2 className="me-2" />
          Edit product
        </Link>
      </div>

      <div className="row g-4">
        {/* ---------- Images ---------- */}
        <div className="col-12 col-lg-5">
          <div className="luma-card">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h2 className="pe-section-title">Product Images</h2>
                <p className="pe-section-subtitle">
                  {images.length} image{images.length === 1 ? "" : "s"}
                </p>
              </div>
              <FiImage size={20} className="text-secondary" />
            </div>

            <div className="p-3">
              {images.length > 0 ? (
                <div className="row g-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={image.primary ? "col-12" : "col-6 col-md-4"}
                    >
                      <div className="position-relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(image.url)}
                          alt={`${product.name} product image`}
                          className="w-100 rounded-3 border"
                          style={{
                            height: image.primary ? 320 : 150,
                            objectFit: "contain",
                            backgroundColor: "#f8f9fa",
                          }}
                        />

                        {image.primary && (
                          <span className="badge bg-success position-absolute top-0 start-0 m-2">
                            Primary Image
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-secondary">
                  <FiImage size={42} className="mb-3" />
                  <h6>No product images</h6>
                  <p className="small mb-0">Add images on the edit page.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Summary + variants ---------- */}
        <div className="col-12 col-lg-7">
          <div className="luma-card p-4 mb-4">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className={`pv-pill ${product.active ? "is-good" : "is-bad"}`}>
                {product.active ? "Active" : "Inactive"}
              </span>
              <span className={`pv-pill ${product.inStock ? "is-good" : "is-bad"}`}>
                {product.inStock ? `In stock · ${totalStock} units` : "Out of stock"}
              </span>
            </div>

            <div className="text-secondary small">From</div>
            <div className="pv-price mb-3">{formatPrice(product.minPrice)}</div>

            <p className="text-secondary mb-4" style={{ whiteSpace: "pre-wrap" }}>
              {product.description || "No description."}
            </p>

            <dl className="row pv-meta mb-0">
              <div className="col-6 col-md-4">
                <dt>Brand</dt>
                <dd>{product.brandName}</dd>
              </div>
              <div className="col-6 col-md-4">
                <dt>Category</dt>
                <dd>
                  {product.categoryName}
                  {product.subcategoryName && ` › ${product.subcategoryName}`}
                </dd>
              </div>
              <div className="col-6 col-md-4">
                <dt>Style code</dt>
                <dd>{product.sku}</dd>
              </div>
              <div className="col-6 col-md-4">
                <dt>URL slug</dt>
                <dd>{product.slug}</dd>
              </div>
              <div className="col-6 col-md-4">
                <dt>Created</dt>
                <dd>{formatDate(product.createdAt)}</dd>
              </div>
              <div className="col-6 col-md-4">
                <dt>Last updated</dt>
                <dd>{formatDate(product.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <ProductVariants variants={product.variants ?? []} />
        </div>
      </div>
    </div>
  );
}
