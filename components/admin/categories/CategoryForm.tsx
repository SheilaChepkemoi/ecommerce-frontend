"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import CreatableSelect from "react-select/creatable";

import Modal from "@/components/shared/Modal";
import { useFieldErrors } from "@/app/hooks/useFieldErrors";
import type { CategoryResponse } from "@/app/types/categories";

export interface CategoryFormValues {
  name: string;
  description: string | null;
  subcategoryNames: string[];
}

interface CategoryFormModalProps {
  show: boolean;
  category: CategoryResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (values: CategoryFormValues) => Promise<void>;
}

interface Tag {
  label: string;
  value: string;
}

const toTag = (name: string): Tag => ({ label: name, value: name.toLowerCase() });

function TagInput({
  tags,
  onChange,
  disabled,
}: {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const name = input.trim();
    setInput("");

    if (name && !tags.some((tag) => tag.value === name.toLowerCase())) {
      onChange([...tags, toTag(name)]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (input && (event.key === "Enter" || event.key === "," || event.key === "Tab")) {
      event.preventDefault();
      addTag();
    }
  };

  return (
    <CreatableSelect<Tag, true>
      isMulti
      isClearable={false}
      menuIsOpen={false}
      components={{ DropdownIndicator: null }}
      inputValue={input}
      onInputChange={(value) => setInput(value)}
      onKeyDown={handleKeyDown}
      onBlur={addTag}
      value={tags}
      onChange={(value) => onChange([...value])}
      isDisabled={disabled}
      classNamePrefix="luma-select"
      placeholder="Enter a subcategory"
    />
  );
}

/** Add / edit a category: name, description and its subcategories. */
export default function CategoryFormModal({
  show,
  category,
  isSubmitting,
  onClose,
  onSave,
}: CategoryFormModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);

  // The rules for each field: the error message, or "" when it's fine.
  // Checked when the user leaves a field, and all together on Save.
  const { errors, checkField, clearField, validateAll, resetErrors } = useFieldErrors({
    name: () => (name.trim() ? "" : "Category name is required."),
    tags: () => {
      const tooLong = tags.find((tag) => tag.label.length > 100);
      return tooLong ? `"${tooLong.label.slice(0, 20)}…" is too long (100 characters max).` : "";
    },
  });

  useEffect(() => {
    if (!show) return;
    resetErrors();
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setTags(
      (category?.subcategories ?? [])
        .filter((sub) => sub.active)
        .map((sub) => toTag(sub.name)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, category]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateAll()) return; // show the messages, send nothing

    await onSave({
      name: name.trim(),
      description: description.trim() || null,
      subcategoryNames: tags.map((tag) => tag.label),
    });
  };

  return (
    <Modal
      show={show}
      title={category ? "Edit category" : "Add category"}
      onClose={onClose}
      onSubmit={() => formRef.current?.requestSubmit()}
      submitLabel={category ? "Save Changes" : "Create"}
      isSubmitting={isSubmitting}
      size="lg"
    >
      {/* noValidate: our own messages replace the browser's pop-ups */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="category-name" className="form-label fw-medium">
            Category <span className="text-danger">*</span>
          </label>
          <input
            id="category-name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="e.g. Clothing"
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

        <div className="mb-3">
          <label className="form-label fw-medium">Subcategories</label>
          <TagInput
            tags={tags}
            onChange={(newTags) => {
              setTags(newTags);
              clearField("tags");
            }}
            disabled={isSubmitting}
          />
          {errors.tags && <div className="text-danger small mt-1">{errors.tags}</div>}
          <div className="form-text">
            {category
              ? "× removes a subcategory (it is hidden from the shop, not deleted). Type a name and press Enter to add one."
              : "Optional. You can add subcategories later."}
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="category-description" className="form-label fw-medium">
            Description
          </label>
          <textarea
            id="category-description"
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
