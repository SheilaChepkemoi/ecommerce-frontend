interface BarListProps {
  items: { label: string; value: number }[];
  /** How to show each value, e.g. formatKesCompact. Default: the plain number. */
  formatValue?: (value: number) => string;
}

/**
 * A list of horizontal bars, one per item, all in the same colour.
 * The longest bar is the biggest value; each value is written at the end.
 */
export default function BarList({ items, formatValue = String }: BarListProps) {
  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <ul className="dash-bars">
      {items.map((item) => (
        <li key={item.label} title={`${item.label}: ${formatValue(item.value)}`}>
          <div className="dash-bars-row">
            <span>{item.label}</span>
            <span className="dash-bars-value">{formatValue(item.value)}</span>
          </div>

          <div className="dash-bars-track">
            <div
              className="dash-bars-fill"
              style={{ width: max > 0 ? `${(item.value / max) * 100}%` : 0 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
