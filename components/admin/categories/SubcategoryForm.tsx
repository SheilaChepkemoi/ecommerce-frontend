"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Select from "react-select";

import Modal from "@/components/shared/Modal";
import { useCategories } from "@/app/hooks/useCategories";
import { useFieldErrors } from "@/app/hooks/useFieldErrors";
import type {
  SubcategoryRequest,
  SubcategoryResponse,
} from "@/app/types/categories";

interface SubcategoryFormModalProps {
  show: boolean;
  /** The subcategory being edited, or null when adding. */
  subcategory: SubcategoryResponse | null;
  /** Pre-selected category when adding from inside a category row. */
  defaultCategoryId?: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (values: SubcategoryRequest) => Promise<void>;
}

/** Add / edit a subcategory: its category, name and description. */
export default function SubcategoryFormModal({
  show,
  subcategory,
  defaultCategoryId = null,
  isSubmitting,
  onClose,
  onSave,
}: SubcategoryFormModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // The rules for each field: the error message, or "" when it's fine.
  // Checked when the user leaves a field, and all together on Save.
  const { errors, checkField, clearField, validateAll, resetErrors } = useFieldErrors({
    categoryId: () => (categoryId !== null ? "" : "Please choose a category."),
    name: () => (name.trim() ? "" : "Subcategory name is required."),
  });

  // Fill the form each time the modal opens.
  useEffect(() => {
    if (!show) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryId(subcategory?.categoryId ?? defaultCategoryId);
    setName(subcategory?.name ?? "");
    setDescription(subcategory?.description ?? "");
    resetErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, subcategory, defaultCategoryId]);

  // Active categories for the dropdown (the page only holds one page of
  // them, so the form loads its own list while it's open).
  const { data } = useCategories({ page: 0, pageSize: 100, status: "active", sortBy: "name" }, show);

  const options = (data?.content ?? []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateAll()) return; // show the messages, send nothing

    await onSave({
      categoryId: categoryId!, // "!" = validateAll() made sure it isn't null
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  return (
    <Modal
      show={show}
      title={subcategory ? "Edit subcategory" : "Add subcategory"}
      onClose={onClose}
      onSubmit={() => formRef.current?.requestSubmit()}
      submitLabel={subcategory ? "Save Changes" : "Create"}
      isSubmitting={isSubmitting}
      size="lg"
    >
      {/* noValidate: our own messages replace the browser's pop-ups */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label fw-medium">
            Category <span className="text-danger">*</span>
          </label>
          <Select
            options={options}
            value={options.find((option) => option.value === categoryId) ?? null}
            onChange={(option) => {
              setCategoryId(option?.value ?? null);
              clearField("categoryId");
            }}
            onBlur={() => checkField("categoryId")}
            isDisabled={isSubmitting}
            classNamePrefix="luma-select"
            placeholder="Choose a category..."
          />
          {errors.categoryId && <div className="text-danger small mt-1">{errors.categoryId}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="subcategory-name" className="form-label fw-medium">
            Subcategory <span className="text-danger">*</span>
          </label>
          <input
            id="subcategory-name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="e.g. Dresses"
            value={name}
            maxLength={100}
            onChange={(event) => {
              setName(event.target.value);
              clearField("name"); // hide the message while typing
            }}
            onBlur={() => checkField("name")}
            disabled={isSubmitting}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="mb-2">
          <label htmlFor="subcategory-description" className="form-label fw-medium">
            Description
          </label>
          <textarea
            id="subcategory-description"
            className="form-control"
            value={description}
            rows={3}
            maxLength={500}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
}
