/** The green "Active" / red "Inactive" pill used in every admin table. */
export default function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`luma-status ${active ? "luma-status-active" : "luma-status-inactive"}`}>
      <span className="luma-status-dot" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
