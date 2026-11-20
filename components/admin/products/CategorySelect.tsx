"use client";

import Select from "react-select";

import type { CategoryResponse } from "@/app/types/categories";

interface CategorySelectProps {
  /** Categories, each with its subcategories inside. */
  categories: CategoryResponse[];
  categoryId: number;
  subcategoryId: number | null;
  onChange: (categoryId: number, subcategoryId: number | null) => void;
  /** Called when the user leaves the Category dropdown (to check it). */
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
}

/** Two dropdowns: Category (Clothing, Shoes, Bags) and Subcategory (Dresses, Sneakers ...). */
export default function CategorySelect({
  categories,
  categoryId,
  subcategoryId,
  onChange,
  onBlur,
  disabled = false,
  error,
}: CategorySelectProps) {
  const toOption = (item: { id: number; name: string; active: boolean }) => ({
    value: item.id,
    label: item.active ? item.name : `${item.name} (inactive)`,
  });

  // Inactive ones are hidden, unless the product already uses them.
  const categoryOptions = categories
    .filter((category) => category.active || category.id === categoryId)
    .map(toOption);

  const subcategoryOptions = (
    categories.find((category) => category.id === categoryId)
      ?.subcategories ?? []
  )
    .filter((sub) => sub.active || sub.id === subcategoryId)
    .map(toOption);

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="pe-label d-block">
          Category <span className="text-danger">*</span>
        </label>
        <Select
          options={categoryOptions}
          value={
            categoryOptions.find((option) => option.value === categoryId) ??
            null
          }
          // Changing the category clears the subcategory.
          onChange={(option) => onChange(option?.value ?? 0, null)}
          onBlur={onBlur}
          isDisabled={disabled}
          classNamePrefix="luma-select"
          placeholder="e.g. Clothing"
        />
        {error && <div className="text-danger small mt-1">{error}</div>}
      </div>

      <div className="col-md-6">
        <label className="pe-label d-block">Subcategory</label>
        <Select
          options={subcategoryOptions}
          value={
            subcategoryOptions.find(
              (option) => option.value === subcategoryId,
            ) ?? null
          }
          onChange={(option) => onChange(categoryId, option?.value ?? null)}
          isDisabled={
            disabled || !categoryId || subcategoryOptions.length === 0
          }
          isClearable
          classNamePrefix="luma-select"
          placeholder={
            !categoryId
              ? "Pick a category first"
              : subcategoryOptions.length === 0
                ? "No subcategories"
                : "e.g. Dresses"
          }
        />
      </div>
    </div>
  );
}
