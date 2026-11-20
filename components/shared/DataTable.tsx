"use client";

import { Fragment, type ReactNode } from "react";
import { getErrorMessage } from "@/app/lib/getErrorMessage";

export interface DataTableColumn<T> {
  key: string;
  title: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;

  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;

  /** The error object from the query. Its message is shown, or "Failed to fetch" if it has none. */
  error?: unknown;
  /** Optional: overrides the message taken from `error` */
  errorMessage?: string;

  emptyTitle?: string;
  emptyMessage?: string;
  loadingMessage?: string;

  onRetry?: () => void;
  renderEmptyIcon?: ReactNode;
  renderErrorIcon?: ReactNode;
  headerClassName?: string;
  /** Optional extra <tr> rows shown under a row (e.g. its subcategories). */
  renderSubRows?: (row: T) => ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  errorMessage,
  emptyTitle = "No records found",
  emptyMessage = "There are currently no records available.",
  loadingMessage = "Loading records...",
  onRetry,
  renderEmptyIcon,
  renderErrorIcon,
  headerClassName,
  renderSubRows,
}: DataTableProps<T>) {
  const columnCount = columns.length;

  // Backend message if there is one, otherwise "Failed to fetch"
  const resolvedErrorMessage = errorMessage ?? getErrorMessage(error);

  return (
    <div className="luma-table-wrapper">
      {isFetching && !isLoading && !isError && (
        <div
          className="px-4 py-2 border-bottom"
          role="status"
          aria-live="polite"
        >
          <span className="small text-secondary">
            Updating records...
          </span>
        </div>
      )}

      <div className="table-responsive">
        <table className="table luma-table align-middle mb-0">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.className ?? ""}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="luma-table-state"
                >
                  <div className="d-flex flex-column align-items-center gap-3">
                    <div
                      className="spinner-border luma-spinner"
                      role="status"
                    >
                      <span className="visually-hidden">
                        Loading...
                      </span>
                    </div>

                    <span className="text-secondary">
                      {loadingMessage}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && isError && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="luma-table-state"
                >
                  <div className="d-flex flex-column align-items-center gap-3">
                    <div className="luma-table-state-icon">
                      {renderErrorIcon ?? "!"}
                    </div>

                    <div className="text-center" role="alert">
                      <div className="fw-semibold mb-1">
                        Unable to load records
                      </div>

                      <div className="text-secondary small text-break">
                        {resolvedErrorMessage}
                      </div>
                    </div>

                    {onRetry && (
                      <button
                        type="button"
                        className="luma-btn luma-btn-secondary"
                        onClick={onRetry}
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && data.length === 0 && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="luma-table-state"
                >
                  <div className="d-flex flex-column align-items-center gap-3">
                    <div className="luma-table-state-icon">
                      {renderEmptyIcon ?? "—"}
                    </div>

                    <div className="text-center">
                      <div className="fw-semibold mb-1">
                        {emptyTitle}
                      </div>

                      <div className="text-secondary small">
                        {emptyMessage}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              data.map((row) => (
                <Fragment key={getRowKey(row)}>
                  <tr>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={column.className ?? ""}
                      >
                        {column.render
                          ? column.render(row)
                          : String(
                              (row as Record<string, unknown>)[
                                column.key
                              ] ?? ""
                            )}
                      </td>
                    ))}
                  </tr>
                  {renderSubRows?.(row)}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}