import { FiEdit2, FiPower } from "react-icons/fi";

import Button from "@/components/shared/Button";

interface RowActionsProps {
  /** Used in the button tooltips, e.g. "Edit Zara". */
  name: string;
  active: boolean;
  onEdit: () => void;
  /** Should open the "Are you sure?" confirmation. */
  onToggle: () => void;
}

/** The ✎ edit and ⏻ activate/deactivate buttons at the end of a table row. */
export default function RowActions({ name, active, onEdit, onToggle }: RowActionsProps) {
  const toggleLabel = `${active ? "Deactivate" : "Activate"} ${name}`;

  return (
    <div className="d-flex justify-content-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        className="luma-btn-icon luma-btn-edit"
        title={`Edit ${name}`}
        aria-label={`Edit ${name}`}
        onClick={onEdit}
      >
        <FiEdit2 size={15} />
      </Button>

      <Button
        variant="secondary"
        size="sm"
        className="luma-btn-icon luma-btn-toggle"
        title={toggleLabel}
        aria-label={toggleLabel}
        onClick={onToggle}
      >
        <FiPower size={16} />
      </Button>
    </div>
  );
}
