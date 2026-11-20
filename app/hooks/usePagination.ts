"use client";

import { useState } from "react";

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

/**
 * Page number and rows-per-page for an admin table.
 * currentPage is 1-based (as shown on screen); the backend is 0-based,
 * so pages send `currentPage - 1` to the API.
 */
export function usePagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  /** Back to page 1, e.g. after the search or filters change. */
  const resetPage = () => setCurrentPage(1);

  return { currentPage, pageSize, changePage, changePageSize, resetPage };
}
