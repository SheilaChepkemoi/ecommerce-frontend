"use client";

import { useState } from "react";

/**
 * Form error messages, one per field.
 *
 * `rules` has one function per field that returns the error message,
 * or "" when the value is fine. For example:
 *
 *   const { errors, checkField, clearField, validateAll, resetErrors } = useFieldErrors({
 *     name: () => (name.trim() ? "" : "Name is required."),
 *   });
 *
 * - checkField("name"):  when the user leaves the field (onBlur)
 * - clearField("name"):  while the user types (onChange)
 * - validateAll():       when Save is clicked; returns true if every field is fine
 * - resetErrors():       when the form opens again
 */
export function useFieldErrors<Field extends string>(rules: Record<Field, () => string>) {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const checkField = (field: Field) => {
    setErrors((previous) => ({ ...previous, [field]: rules[field]() }));
  };

  const clearField = (field: Field) => {
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validateAll = () => {
    const newErrors: Partial<Record<Field, string>> = {};

    for (const field of Object.keys(rules) as Field[]) {
      newErrors[field] = rules[field]();
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((message) => !message);
  };

  const resetErrors = () => setErrors({});

  return { errors, checkField, clearField, validateAll, resetErrors };
}
