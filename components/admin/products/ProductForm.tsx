
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Select from "react-select";

import type {
  ProductRequest,
  ProductResponse,
} from "@/app/types/products";

import type { BrandResponse } from "@/app/types/brands";
import type { CategoryResponse } from "@/app/types/categories";

import { useFieldErrors } from "@/app/hooks/useFieldErrors";
import Modal from "@/components/shared/Modal";
import ProductImageUpload from "@/components/admin/products/ProductImageUpload";
import CategorySelect from "@/components/admin/products/CategorySelect";

interface ProductFormProps {
  show: boolean;
  product: ProductResponse | null;
  brands: BrandResponse[];
  categories: CategoryResponse[];
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (
    request: ProductRequest,
    files: File[]
  ) => Promise<File[]>;
}

interface SelectOption {
  value: number;
  label: string;
}

/** One size/colour row in the form (inputs are kept as text). */
interface VariantRow {
  size: string;
  colour: string;
  price: string;
  stockQuantity: string;
}

const emptyVariant: VariantRow = {
  size: "",
  colour: "",
  price: "",
  stockQuantity: "",
};

/** A row needs a price above 0 and a whole-number stock of 0 or more. */
const isInvalidVariant = (row: VariantRow) =>
  !(Number(row.price) > 0) ||
  row.stockQuantity === "" ||
  !Number.isInteger(Number(row.stockQuantity)) ||
  Number(row.stockQuantity) < 0;

const initialFormData: ProductRequest = {
  name: "",
  description: "",
  brandId: 0,
  categoryId: 0,
  subcategoryId: null,
};

export default function ProductForm({
  show,
  product,
  brands,
  categories,
  isSubmitting,
  onClose,
  onSave,
}: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] =
    useState<ProductRequest>(initialFormData);

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Variants are only entered when creating; after that they are
  // managed on the product page.
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant]);
  const isCreating = !product;

  // The rules for each field: the error message, or "" when it's fine.
  // Checked when the user leaves a field, and all together on Save.
  const { errors, checkField, clearField, validateAll, resetErrors } = useFieldErrors({
    name: () => (formData.name.trim() ? "" : "Product name is required."),
    brandId: () => (formData.brandId ? "" : "Please select a brand."),
    categoryId: () => (formData.categoryId ? "" : "Please select a category."),
    // Only checked on Save (there's no single field to leave)
    variants: () =>
      isCreating && variants.some(isInvalidVariant)
        ? "Each size/colour needs a price above 0 and a stock of 0 or more."
        : "",
  });

  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    setVariants((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    clearField("variants");
  };

  const brandOptions: SelectOption[] = brands
    .filter((brand) => brand.active)
    .map((brand) => ({
      value: brand.id,
      label: brand.name,
    }));

  const selectedBrand =
    brandOptions.find(
      (option) => option.value === formData.brandId
    ) ?? null;

  useEffect(() => {
    if (!show) return;

    if (product) {
      setFormData({
        name: product.name ?? "",
        description: product.description ?? "",
        brandId: product.brandId ?? 0,
        categoryId: product.categoryId ?? 0,
        subcategoryId: product.subcategoryId ?? null,
      });
    } else {
      setFormData(initialFormData);
    }

    setImageFiles([]);
    setVariants([emptyVariant]);
    resetErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, product]);

  const handleChange = (
    field: keyof ProductRequest,
    value: string | number
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting || !validateAll()) {
      return;
    }

    const request: ProductRequest = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      brandId: Number(formData.brandId),
      categoryId: Number(formData.categoryId),
      subcategoryId: formData.subcategoryId,
      variants: isCreating
        ? variants.map((row) => ({
            size: row.size.trim() || null,
            colour: row.colour.trim() || null,
            price: Number(row.price),
            stockQuantity: Number(row.stockQuantity),
          }))
        : undefined,
    };

    const failedFiles = await onSave(request, imageFiles);

    setImageFiles(failedFiles);
  };

  return (
    <Modal
      show={show}
      title={product ? "Edit Product" : "Add Product"}
      onClose={onClose}
      onSubmit={() => formRef.current?.requestSubmit()}
      submitLabel={product ? "Update Product" : "Create Product"}
      isSubmitting={isSubmitting}
      submitDisabled={isSubmitting}
      size="lg"
    >
      {/* noValidate: our own messages replace the browser's pop-ups */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          {/* Product Name */}
          <div className="col-md-12">
            <label className="form-label fw-medium">
              Product Name <span className="text-danger">*</span>
            </label>

            <input
              type="text"
              className={`form-control ${
                errors.name ? "is-invalid" : ""
              }`}
              placeholder="Enter product name"
              value={formData.name}
              onChange={(event) => {
                handleChange("name", event.target.value);
                clearField("name"); // hide the message while typing
              }}
              onBlur={() => checkField("name")}
              disabled={isSubmitting}
            />

            {errors.name && (
              <div className="invalid-feedback">
                {errors.name}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="col-md-12">
            <label className="form-label fw-medium">
              Description
            </label>

            <textarea
              className="form-control"
              rows={4}
              placeholder="Enter product description"
              value={formData.description}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Brand */}
          <div className="col-12">
            <label className="form-label fw-medium">
              Brand <span className="text-danger">*</span>
            </label>

            <Select<SelectOption, false>
              options={brandOptions}
              value={selectedBrand}
              onChange={(option) => {
                handleChange("brandId", option?.value ?? 0);
                clearField("brandId");
              }}
              onBlur={() => checkField("brandId")}
              placeholder="Search or select a brand..."
              isSearchable
              isClearable
              isDisabled={isSubmitting}
              noOptionsMessage={() => "No brands found"}
              className={errors.brandId ? "is-invalid" : ""}
              classNamePrefix="luma-select"
            />

            {errors.brandId && (
              <div className="text-danger small mt-1">
                {errors.brandId}
              </div>
            )}
          </div>

          {/* Category + subcategory */}
          <div className="col-12">
            <CategorySelect
              categories={categories}
              categoryId={formData.categoryId}
              subcategoryId={formData.subcategoryId}
              onChange={(categoryId, subcategoryId) => {
                setFormData((previous) => ({
                  ...previous,
                  categoryId,
                  subcategoryId,
                }));
                clearField("categoryId");
              }}
              onBlur={() => checkField("categoryId")}
              disabled={isSubmitting}
              error={errors.categoryId}
            />
          </div>

          {/* Sizes / colours with price and stock */}
          {isCreating ? (
            <div className="col-12">
              <label className="form-label fw-medium mb-1">
                Sizes, prices &amp; stock <span className="text-danger">*</span>
              </label>
              <p className="text-secondary small mb-2">
                Add one row per size/colour. Leave size and colour empty for
                items like bags.
              </p>

              {variants.map((row, index) => (
                <div className="row g-2 mb-2" key={index}>
                  <div className="col-6 col-md-2">
                    <input
                      className="form-control"
                      placeholder="Size"
                      value={row.size}
                      onChange={(e) => updateVariant(index, "size", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <input
                      className="form-control"
                      placeholder="Colour"
                      value={row.colour}
                      onChange={(e) => updateVariant(index, "colour", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-5 col-md-3">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="form-control"
                      placeholder="Price (KES)"
                      value={row.price}
                      onChange={(e) => updateVariant(index, "price", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-5 col-md-3">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      placeholder="Stock"
                      value={row.stockQuantity}
                      onChange={(e) => updateVariant(index, "stockQuantity", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-2 col-md-1">
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      title="Remove"
                      disabled={isSubmitting || variants.length === 1}
                      onClick={() =>
                        setVariants((rows) => rows.filter((_, i) => i !== index))
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={isSubmitting}
                onClick={() => setVariants((rows) => [...rows, emptyVariant])}
              >
                + Add size/colour
              </button>

              {errors.variants && (
                <div className="text-danger small mt-1">{errors.variants}</div>
              )}
            </div>
          ) : (
            <div className="col-12">
              <div className="alert alert-light border small mb-0">
                Prices and stock are set per size/colour on the product page.
              </div>
            </div>
          )}

          {/* Product Images */}
          <div className="col-12">
            <ProductImageUpload
              files={imageFiles}
              existingImages={product?.images ?? []}
              disabled={isSubmitting}
              onChange={setImageFiles}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
