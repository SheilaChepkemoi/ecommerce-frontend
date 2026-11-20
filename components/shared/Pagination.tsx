
"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  /** Current page, 1-based */
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  /** Plural noun for the showing text */
  itemLabel?: string;
  /** True while a background refetch is running */
  isFetching?: boolean;
  onPageChange: (page: number) => void;

  /** Optional rows-per-page selector */
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

type PageItem = number | "start-ellipsis" | "end-ellipsis";

/**
 * Always returns at most 7 slots.
 */
function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", total];
  }

  if (current >= total - 3) {
    return [
      1,
      "start-ellipsis",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  }

  return [
    1,
    "start-ellipsis",
    current - 1,
    current,
    current + 1,
    "end-ellipsis",
    total,
  ];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  itemLabel = "items",
  isFetching = false,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: PaginationProps) {
  if (totalElements === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalElements);

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const showPageSizeSelector =
    Boolean(pageSizeOptions?.length) && Boolean(onPageSizeChange);

  return (
    <div className="luma-pagination d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 border-top">
      {/* Record information and page-size selector */}
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div className="luma-pagination-info">
          Showing{" "}
          <strong>
            {start}–{end}
          </strong>{" "}
          of <strong>{totalElements}</strong> {itemLabel}

          {isFetching && <span className="ms-2">Updating…</span>}
        </div>

        {showPageSizeSelector && (
          <div className="d-flex align-items-center gap-2">
            <label
              htmlFor="pagination-page-size"
              className="form-label mb-0 text-nowrap"
            >
              Rows per page:
            </label>

            <select
              id="pagination-page-size"
              className="form-select form-select-sm w-auto"
              value={pageSize}
              onChange={(event) =>
                onPageSizeChange?.(Number(event.target.value))
              }
              aria-label="Select rows per page"
            >
              {pageSizeOptions!.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <nav aria-label={`${itemLabel} pagination`}>
          <ul className="pagination mb-0">
            {/* Previous */}
            <li className={`page-item ${isFirst ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                disabled={isFirst}
                aria-label="Previous page"
                onClick={() => onPageChange(currentPage - 1)}
              >
                <FiChevronLeft size={16} aria-hidden="true" />
              </button>
            </li>

            {/* Page numbers */}
            {getPageItems(currentPage, totalPages).map((item) =>
              typeof item === "number" ? (
                <li
                  key={item}
                  className={`page-item d-none d-sm-block ${
                    item === currentPage ? "active" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    aria-label={`Page ${item}`}
                    aria-current={item === currentPage ? "page" : undefined}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </button>
                </li>
              ) : (
                <li
                  key={item}
                  className="luma-pagination-ellipsis d-none d-sm-flex"
                  aria-hidden="true"
                >
                  …
                </li>
              )
            )}

            {/* Mobile page indicator */}
            <li className="luma-pagination-status d-sm-none">
              Page {currentPage} of {totalPages}
            </li>

            {/* Next */}
            <li className={`page-item ${isLast ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                disabled={isLast}
                aria-label="Next page"
                onClick={() => onPageChange(currentPage + 1)}
              >
                <FiChevronRight size={16} aria-hidden="true" />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
