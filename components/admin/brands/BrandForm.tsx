"use client";

import { useEffect, useRef, useState } from "react";

import { useFieldErrors } from "@/app/hooks/useFieldErrors";

import type {
  BrandRequest,
  BrandResponse,
} from "@/app/types/brands";
import Modal from "@/components/shared/Modal";

interface BrandFormModalProps {
  show: boolean;
  brand: BrandResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (request: BrandRequest) => Promise<void>;
}

export default function BrandFormModal({
  show,
  brand,
  isSubmitting,
  onClose,
  onSave,
}: BrandFormModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // The rules for each field: the error message, or "" when it's fine.
  // Checked when the user leaves a field, and all together on Save.
  const { errors, checkField, clearField, validateAll, resetErrors } = useFieldErrors({
    name: () => (name.trim() ? "" : "Brand name is required."),

    // The code can't be changed when editing, so only check it when adding.
    code: () =>
      !brand && code.trim() && !/^[A-Za-z0-9]{2,5}$/.test(code.trim())
        ? "Use 2–5 letters or numbers, or leave it empty."
        : "",
  });

  useEffect(() => {
    if (!show) return;

    setName(brand?.name ?? "");
    setCode(brand?.code ?? "");
    resetErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, brand]);

  const handleSubmit = async (
   e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateAll()) return; // show the messages, send nothing

    const data: BrandRequest = {
      name: name.trim(),
      code: code.trim() || null, // empty = let the backend generate it
    };

    await onSave(data);
  };

  const requestSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Modal
      show={show}
      title={brand ? "Edit Brand" : "Add Brand"}
      onClose={onClose}
      onSubmit={requestSubmit}
      submitLabel={brand ? "Save Changes" : "Create Brand"}
      isSubmitting={isSubmitting}
      size="lg"
    >
      {/* noValidate: our own messages replace the browser's pop-ups */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label
            htmlFor="brand-name"
            className="form-label fw-medium"
          >
            Brand Name <span className="text-danger">*</span>
          </label>

          <input
            id="brand-name"
            name="name"
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearField("name"); // hide the message while typing
            }}
            onBlur={() => checkField("name")}
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="mb-2">
          <label
            htmlFor="brand-code"
            className="form-label fw-medium"
          >
            Brand Code
          </label>

          <input
            id="brand-code"
            name="code"
            type="text"
            className={`form-control ${errors.code ? "is-invalid" : ""}`}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              clearField("code");
            }}
            onBlur={() => checkField("code")}
            maxLength={5}
            disabled={isSubmitting || !!brand}
          />

          {errors.code ? (
            <div className="invalid-feedback">{errors.code}</div>
          ) : (
            !brand && (
              <div className="form-text">
                Optional. If provided, use 2–5 letters or numbers.
              </div>
            )
          )}
        </div>
      </form>
    </Modal>
  );
}
