/** "2026-11-19T10:45:00" -> "2026-11-19"; missing -> "" (shows nothing) */
export const formatDate = (value: string | null) =>
  value ? value.slice(0, 10) : "";

/** 2500 -> "KES 2,500.00"; missing -> "" (shows nothing) */
export const formatPrice = (price: number | null) =>
  price === null
    ? ""
    : `KES ${price.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** 1284 -> "1,284"; 12900 -> "12.9K"; 1865000 -> "1.9M" */
export const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

/** 1865000 -> "KES 1.9M"; 8450 -> "KES 8,450" */
export const formatKesCompact = (value: number) => `KES ${formatCompact(value)}`;
