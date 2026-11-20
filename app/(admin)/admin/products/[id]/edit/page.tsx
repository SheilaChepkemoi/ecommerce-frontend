"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";

import { useProduct } from "@/app/hooks/useProduct";
import { getErrorMessage } from "@/app/lib/getErrorMessage";
import EditProductForm from "@/components/admin/products/EditProductForm";

/**
 * Loads the product, then shows the form.
 *
 * The form gets a `key`: when it changes, React builds a fresh form from
 * the latest product data (used after saving, so the form matches the DB).
 */
export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);

  const [formVersion, setFormVersion] = useState(0);

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

  return (
    <div>
      <div className="luma-page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <div className="luma-page-header-icon" aria-hidden="true">
            <FiEdit3 size={22} />
          </div>
          <div>
            <h1 className="h4 mb-0 fw-semibold">Edit product</h1>
            <span className="text-secondary small">
              {product.name} · <span className="luma-code">{product.sku}</span>
            </span>
          </div>
        </div>

        <Link href={`/admin/products/${product.id}`} className="luma-btn luma-btn-secondary">
          <FiArrowLeft className="me-2" />
          Back to product
        </Link>
      </div>

      <EditProductForm
        key={`${product.id}-${formVersion}`}
        product={product}
        onSaved={async () => {
          await refetch();
          setFormVersion((version) => version + 1);
        }}
      />
    </div>
  );
}
