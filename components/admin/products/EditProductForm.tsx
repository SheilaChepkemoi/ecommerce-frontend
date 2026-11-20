"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import toast from "react-hot-toast";
import { FiPlus, FiSave, FiX } from "react-icons/fi";

import Button from "@/components/shared/Button";
import ProductImageUpload from "@/components/admin/products/ProductImageUpload";
import CategorySelect from "@/components/admin/products/CategorySelect";
import { useBrands } from "@/app/hooks/useBrands";
import { useCategories } from "@/app/hooks/useCategories";
import {
  useDeleteProductImage,
  useSaveProduct,
  useSaveProductVariant,
  useSetPrimaryProductImage,
  useSetProductVariantActive,
  useUploadProductImage,
} from "@/app/hooks/useProductMutations";
import { useFieldErrors } from "@/app/hooks/useFieldErrors";
import { runSteps } from "@/app/lib/runSteps";

import type {
  ProductImageResponse,
  ProductResponse,
  ProductVariantRequest,
  ProductVariantResponse,
} from "@/app/types/products";

// ==================================================
// Form state types
// ==================================================

/** One row in the variants table. Inputs are kept as text. */
interface VariantRow {
  key: string;
  original?: ProductVariantResponse; // undefined = new row
  size: string;
  colour: string;
  price: string;
  stockQuantity: string;
  active: boolean;
}

const toRow = (variant: ProductVariantResponse): VariantRow => ({
  key: `v-${variant.id}`,
  original: variant,
  size: variant.size ?? "",
  colour: variant.colour ?? "",
  price: String(variant.price),
  stockQuantity: String(variant.stockQuantity),
  active: variant.active,
});

/** A row needs a price above 0 and a whole-number stock of 0 or more. */
const isInvalidVariant = (row: VariantRow) =>
  !(Number(row.price) > 0) ||
  row.stockQuantity === "" ||
  !Number.isInteger(Number(row.stockQuantity)) ||
  Number(row.stockQuantity) < 0;

const toRequest = (row: VariantRow): ProductVariantRequest => ({
  size: row.size.trim() || null,
  colour: row.colour.trim() || null,
  price: Number(row.price),
  stockQuantity: Number(row.stockQuantity),
});

// ==================================================
// Component
// ==================================================

interface EditProductFormProps {
  product: ProductResponse;
  /** Called after a save where something failed, to reload the form from the DB. */
  onSaved: () => Promise<void>;
}

/**
 * Edit everything about a product on one screen. Nothing is sent to the
 * server until "Update product" is clicked; then each change is saved in
 * turn. A failed change is reported but does not stop the others.
 */
export default function EditProductForm({
  product,
  onSaved,
}: EditProductFormProps) {
  const router = useRouter();

  const saveProduct = useSaveProduct();
  const saveVariant = useSaveProductVariant();
  const setVariantActive = useSetProductVariantActive();
  const setPrimaryImage = useSetPrimaryProductImage();
  const deleteImage = useDeleteProductImage();
  const uploadImage = useUploadProductImage();

  // --- Details ---
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [brandId, setBrandId] = useState(product.brandId);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(product.subcategoryId);

  // --- Variants ---
  const [rows, setRows] = useState<VariantRow[]>(
    (product.variants ?? []).map(toRow),
  );

  // --- Images ---
  const existingImages: ProductImageResponse[] = product.images ?? [];
  const originalPrimaryId =
    existingImages.find((image) => image.primary)?.id ?? null;

  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<number | null>(
    originalPrimaryId,
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // --- Dropdowns: only active brands and categories can be chosen ---
  const { data: brandsData } = useBrands({ page: 0, pageSize: 100, status: "active" });
  const { data: categoriesData } = useCategories({ page: 0, pageSize: 100, status: "active" });

  const brandOptions = (brandsData?.content ?? []).map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));
  const categories = categoriesData?.content ?? [];

  // If the product still uses a brand/category that was deactivated, it isn't
  // in the lists above, so the admin has to pick an active one.
  const brandIsInactive =
    brandsData !== undefined && !brandOptions.some((option) => option.value === brandId);
  const categoryIsInactive =
    categoriesData !== undefined && !categories.some((category) => category.id === categoryId);

  // ==================================================
  // Variant row helpers
  // ==================================================

  const updateRow = (key: string, changes: Partial<VariantRow>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...changes } : row)),
    );
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      {
        key: `new-${Date.now()}`,
        size: "",
        colour: "",
        price: "",
        stockQuantity: "",
        active: true,
      },
    ]);
  };

  const removeNewRow = (key: string) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  // ==================================================
  // Image helpers (nothing is sent until "Update product")
  // ==================================================

  // What the image component shows: removed images hidden, chosen main image marked.
  const shownImages = existingImages
    .filter((image) => !removedImageIds.includes(image.id))
    .map((image) => ({ ...image, primary: image.id === primaryImageId }));

  const removeExistingImage = (imageId: number) => {
    setRemovedImageIds((current) => [...current, imageId]);

    if (primaryImageId === imageId) {
      setPrimaryImageId(null);
    }
  };

  const undoImageRemovals = () => {
    setRemovedImageIds([]);
    setPrimaryImageId(originalPrimaryId);
  };

  // ==================================================
  // Validation
  // ==================================================

  // The rules for each field: the error message, or "" when it's fine.
  // Checked when the user leaves a field, and all together on Save.
  const { errors, checkField, clearField, validateAll } = useFieldErrors({
    name: () => (name.trim() ? "" : "Product name is required."),
    brandId: () => (brandId && !brandIsInactive ? "" : "Please select an active brand."),
    categoryId: () => (categoryId && !categoryIsInactive ? "" : "Please select an active category."),
    // Only checked on Save (there's no single field to leave)
    variants: () =>
      rows.some(isInvalidVariant)
        ? "Each size/colour needs a price above 0 and a stock of 0 or more."
        : "",
  });

  // ==================================================
  // Save: list every change, then run them one by one.
  // A failed change is toasted (global handler) but doesn't stop the rest.
  // ==================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving || !validateAll()) return;

    const productId = product.id;
    const steps: (() => Promise<unknown>)[] = [];

    // 1. Product details (only if something changed)
    const detailsChanged =
      name.trim() !== product.name ||
      description.trim() !== (product.description ?? "") ||
      brandId !== product.brandId ||
      categoryId !== product.categoryId ||
      subcategoryId !== product.subcategoryId;

    if (detailsChanged) {
      const request = {
        name: name.trim(),
        description: description.trim(),
        brandId,
        categoryId,
        subcategoryId,
      };
      steps.push(() => saveProduct.mutateAsync({ id: productId, request }));
    }

    // 2. Variants: new and changed ones first, deactivations last
    //    (the backend won't let an active product lose its last active variant).
    const deactivations: (() => Promise<unknown>)[] = [];

    for (const row of rows) {
      const original = row.original;

      if (!original) {
        steps.push(() => saveVariant.mutateAsync({ productId, request: toRequest(row) }));
        continue;
      }

      const fieldsChanged =
        row.size.trim() !== (original.size ?? "") ||
        row.colour.trim() !== (original.colour ?? "") ||
        Number(row.price) !== original.price ||
        Number(row.stockQuantity) !== original.stockQuantity;

      if (fieldsChanged) {
        steps.push(() =>
          saveVariant.mutateAsync({ productId, variantId: original.id, request: toRequest(row) })
        );
      }

      if (row.active && !original.active) {
        steps.push(() => setVariantActive.mutateAsync({ productId, variantId: original.id, active: true }));
      }

      if (!row.active && original.active) {
        deactivations.push(() =>
          setVariantActive.mutateAsync({ productId, variantId: original.id, active: false })
        );
      }
    }

    steps.push(...deactivations);

    // 3. Images: new primary first, then removals, then uploads
    if (primaryImageId !== null && primaryImageId !== originalPrimaryId) {
      steps.push(() => setPrimaryImage.mutateAsync({ productId, imageId: primaryImageId }));
    }

    for (const imageId of removedImageIds) {
      steps.push(() => deleteImage.mutateAsync({ productId, imageId }));
    }

    for (const file of newFiles) {
      steps.push(() => uploadImage.mutateAsync({ productId, file }));
    }

    if (steps.length === 0) {
      toast("No changes to save.");
      return;
    }

    // 4. Run them and report
    setIsSaving(true);
    const { saved, failed } = await runSteps(steps);
    setIsSaving(false);

    if (failed === 0) {
      toast.success("Product updated successfully.");
      router.push(`/admin/products/${productId}`);
      return;
    }

    if (saved > 0) {
      toast.success(`${saved} change(s) saved. ${failed} failed.`);
    }

    // Reload the form from the database so it shows what was actually saved.
    await onSaved();
  };

  // ==================================================
  // Render
  // ==================================================

  return (
    // noValidate: our own messages replace the browser's pop-ups
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <div className="row g-4 mb-4">
          {/* Details: half width */}
          <div className="col-12 col-xl-6">
            <div className="luma-card p-4 h-100">
              <h2 className="pe-section-title mb-3">Details</h2>

              <div className="row g-3">
                <div className="col-12">
                  <label className="pe-label" htmlFor="name">
                    Product name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={name}
                    maxLength={255}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearField("name"); // hide the message while typing
                    }}
                    onBlur={() => checkField("name")}
                    disabled={isSaving}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="pe-label">
                    Brand <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={brandOptions}
                    value={
                      brandOptions.find((option) => option.value === brandId) ??
                      null
                    }
                    onChange={(option) => {
                      setBrandId(option?.value ?? 0);
                      clearField("brandId");
                    }}
                    onBlur={() => checkField("brandId")}
                    isDisabled={isSaving}
                    classNamePrefix="luma-select"
                    placeholder="Select a brand..."
                  />
                  {errors.brandId ? (
                    <div className="text-danger small mt-1">{errors.brandId}</div>
                  ) : (
                    brandIsInactive &&
                    brandId === product.brandId && (
                      <div className="text-danger small mt-1">
                        {product.brandName} is inactive. Choose an active brand.
                      </div>
                    )
                  )}
                </div>

                <div className="col-12">
                  <CategorySelect
                    categories={categories}
                    categoryId={categoryId}
                    subcategoryId={subcategoryId}
                    onChange={(newCategoryId, newSubcategoryId) => {
                      setCategoryId(newCategoryId);
                      setSubcategoryId(newSubcategoryId);
                      clearField("categoryId");
                    }}
                    onBlur={() => checkField("categoryId")}
                    disabled={isSaving}
                    error={
                      errors.categoryId ||
                      (categoryIsInactive && categoryId === product.categoryId
                        ? `${product.categoryName} is inactive. Choose an active category.`
                        : undefined)
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="pe-label" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows={4}
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images: other half */}
          <div className="col-12 col-xl-6">
            <div className="luma-card p-4 h-100">
              <ProductImageUpload
                files={newFiles}
                existingImages={shownImages}
                disabled={isSaving}
                onChange={setNewFiles}
                onSetPrimary={(image) => setPrimaryImageId(image.id)}
                onDeleteExisting={(image) => removeExistingImage(image.id)}
              />

              {removedImageIds.length > 0 && (
                <div className="d-flex align-items-center gap-2 small text-danger mt-2">
                  {removedImageIds.length} image(s) will be removed when you
                  save.
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0"
                    onClick={undoImageRemovals}
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="luma-card mb-4">
          <div className="d-flex justify-content-between align-items-center p-4 pb-3">
            <div>
              <h2 className="pe-section-title">Sizes, prices &amp; stock</h2>
              <p className="pe-section-subtitle">
                One row per size/colour. Switch a row off to make it unavailable in the shop.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiPlus />}
              onClick={addRow}
              disabled={isSaving}
            >
              Add size/colour
            </Button>
          </div>

          <div className="table-responsive px-2">
            <table className="table pe-variants mb-0">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Size</th>
                  <th>Colour</th>
                  <th>Price (KES)</th>
                  <th>Stock</th>
                  <th className="text-center">Available</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={
                      !row.original
                        ? "pe-row-new"
                        : !row.active
                          ? "pe-row-inactive"
                          : ""
                    }
                  >
                    <td className="text-nowrap">
                      {row.original ? (
                        <span className="luma-code">{row.original.sku}</span>
                      ) : (
                        <span className="badge text-bg-warning">New</span>
                      )}
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        placeholder="e.g. M"
                        value={row.size}
                        onChange={(e) =>
                          updateRow(row.key, { size: e.target.value })
                        }
                        disabled={isSaving}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        placeholder="e.g. Black"
                        value={row.colour}
                        onChange={(e) =>
                          updateRow(row.key, { colour: e.target.value })
                        }
                        disabled={isSaving}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={row.price}
                        onChange={(e) =>
                          updateRow(row.key, { price: e.target.value })
                        }
                        disabled={isSaving}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="form-control form-control-sm"
                        value={row.stockQuantity}
                        onChange={(e) =>
                          updateRow(row.key, { stockQuantity: e.target.value })
                        }
                        disabled={isSaving}
                      />
                    </td>
                    <td className="text-center">
                      {row.original ? (
                        <div className="form-check form-switch d-inline-block m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            title={row.active ? "Available" : "Unavailable"}
                            checked={row.active}
                            onChange={(e) =>
                              updateRow(row.key, { active: e.target.checked })
                            }
                            disabled={isSaving}
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0"
                          title="Remove this new row"
                          onClick={() => removeNewRow(row.key)}
                          disabled={isSaving}
                        >
                          <FiX size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary py-4">
                      No sizes yet. Click “Add size/colour”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {errors.variants && (
            <div className="text-danger small px-4 pb-3">{errors.variants}</div>
          )}
        </div>

        {/* Save */}
        <div className="luma-card p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="pe-section-subtitle m-0">
            Nothing is saved until you click Update product.
          </span>
          <Button type="submit" loading={isSaving} leftIcon={<FiSave />}>
            Update product
          </Button>
        </div>
      </div>
    </form>
  );
}
