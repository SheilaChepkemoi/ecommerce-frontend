import { FiCheck } from "react-icons/fi";

import type { StatusFilter } from "@/app/types/api";

const OPTIONS: { value: StatusFilter; label: string; dot: string }[] = [
  { value: "active", label: "Active", dot: "bg-success" },
  { value: "inactive", label: "Inactive", dot: "bg-danger" },
  { value: "all", label: "All", dot: "bg-secondary" },
];

/** The Active / Inactive / All pills used in the filter drawers. */
export default function StatusFilterPicker({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <div className="mb-3">
      <label className="luma-filter-label d-block mb-2">Status</label>

      <div className="d-flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-2 status-filter-option ${
              value === option.value ? "selected" : ""
            }`}
            onClick={() => onChange(option.value)}
          >
            {value === option.value ? (
              <FiCheck size={14} />
            ) : (
              <span className={`status-filter-dot ${option.dot}`} />
            )}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
