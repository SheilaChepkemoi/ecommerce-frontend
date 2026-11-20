"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import Button from "@/components/shared/Button";
import DataTable from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import BrandFormModal from "@/components/admin/brands/BrandForm";
import ConfirmModal from "@/components/shared/ConfirmModal";
import FilterDrawer from "@/components/shared/FilterDrawer";
import Pagination from "@/components/shared/Pagination";
import RowActions from "@/components/shared/RowActions";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusFilterPicker from "@/components/shared/StatusFilterPicker";

import { useBrands } from "@/app/hooks/useBrands";
import { useSaveBrand, useSetBrandActive } from "@/app/hooks/useBrandMutations";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import { PAGE_SIZE_OPTIONS, usePagination } from "@/app/hooks/usePagination";
import { formatDate } from "@/app/lib/format";

import type { StatusFilter } from "@/app/types/api";
import type { BrandRequest, BrandResponse } from "@/app/types/brands";

/** The filters in the drawer. The name is searched from the toolbar. */
interface BrandFilters {
  code: string;
  status: StatusFilter;
}

// Active brands by default; Filters → Status shows inactive or all.
const NO_FILTERS: BrandFilters = { code: "", status: "active" };

export default function BrandsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================================================
  // STATE
  // ==================================================

  const { currentPage, pageSize, changePage, changePageSize, resetPage } = usePagination();

  // Toolbar search by name. `search` is what's sent to the API,
  // 400 ms after the user stops typing.
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  // Filter drawer: what the table uses, and what's being edited in the drawer
  const [filters, setFilters] = useState<BrandFilters>(NO_FILTERS);
  const [draftFilters, setDraftFilters] = useState<BrandFilters>(NO_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Add / edit modal (editingBrand = null means "adding")
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);

  // The brand waiting for "Are you sure?" before (de)activating
  const [brandToToggle, setBrandToToggle] = useState<BrandResponse | null>(null);

  // ==================================================
  // DATA
  // ==================================================

  const { data, isLoading, isFetching, isError, error, refetch } = useBrands({
    page: currentPage - 1, // the backend counts pages from 0
    pageSize,
    name: search,
    code: filters.code,
    status: filters.status,
  });

  const brands = isError ? [] : (data?.content ?? []);
  const totalElements = isError ? 0 : (data?.totalElements ?? 0);
  const totalPages = isError ? 0 : (data?.totalPages ?? 0);

  const saveBrand = useSaveBrand();
  const setBrandActive = useSetBrandActive();

  // Labels for the filter chips next to the Filters button
  const appliedFilters: string[] = [];
  if (filters.code) appliedFilters.push(`Code: ${filters.code}`);
  if (filters.status !== "active") {
    appliedFilters.push(`Status: ${filters.status === "inactive" ? "Inactive" : "All"}`);
  }

  // ==================================================
  // EFFECTS
  // ==================================================

  // Open the add modal from the header Create menu (?create=1).
  useEffect(() => {
    if (searchParams.get("create") === "1") {
      router.replace("/admin/brands");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingBrand(null);
      setShowBrandModal(true);
    }
  }, [searchParams, router]);

  // ==================================================
  // HANDLERS: ADD / EDIT
  // ==================================================

  const openBrandModal = (brand: BrandResponse | null) => {
    setEditingBrand(brand);
    setShowBrandModal(true);
  };

  const closeBrandModal = () => {
    if (saveBrand.isPending) return;

    setShowBrandModal(false);
    setEditingBrand(null);
  };

  /** Called by the form with a ready-to-send request. */
  const handleSaveBrand = async (request: BrandRequest) => {
    try {
      await saveBrand.mutateAsync({ id: editingBrand?.id, request });
      toast.success(editingBrand ? "Brand updated successfully." : "Brand created successfully.");

      setShowBrandModal(false);
      setEditingBrand(null);
    } catch {
      // The error toast comes from the global handler.
      // The modal stays open so the user can fix the problem.
    }
  };

  // ==================================================
  // HANDLERS: ACTIVATE / DEACTIVATE
  // ==================================================

  const handleToggleBrand = async () => {
    if (!brandToToggle) return;

    const { id, name, active } = brandToToggle;

    try {
      await setBrandActive.mutateAsync({ id, active: !active });
      toast.success(`${name} ${active ? "deactivated" : "activated"}.`);
      setBrandToToggle(null);
    } catch {
      // The error toast comes from the global handler.
    }
  };

  // ==================================================
  // HANDLERS: SEARCH & FILTERS
  // ==================================================

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    resetPage(); // a new search starts from page 1
  };

  const openFilterDrawer = () => {
    setDraftFilters(filters); // start from what's applied now
    setIsFilterDrawerOpen(true);
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters, code: draftFilters.code.trim() });
    resetPage();
    setIsFilterDrawerOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters(NO_FILTERS);
    setFilters(NO_FILTERS);
    resetPage();
  };

  // ==================================================
  // TABLE COLUMNS
  // ==================================================

  const columns: DataTableColumn<BrandResponse>[] = [
    {
      key: "brand",
      title: "Brand",
      render: (brand) => (
        <div className="d-flex align-items-center gap-3">
          <div className="luma-avatar">{brand.name.charAt(0).toUpperCase()}</div>
          <div className="luma-table-primary">{brand.name}</div>
        </div>
      ),
    },
    {
      key: "code",
      title: "Code",
      render: (brand) => brand.code && <span className="luma-code">{brand.code}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (brand) => <StatusBadge active={brand.active} />,
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (brand) => <span className="luma-table-primary">{formatDate(brand.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      title: "Updated At",
      render: (brand) => <span className="luma-table-primary">{formatDate(brand.updatedAt)}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-end",
      render: (brand) => (
        <RowActions
          name={brand.name}
          active={brand.active}
          onEdit={() => openBrandModal(brand)}
          onToggle={() => setBrandToToggle(brand)}
        />
      ),
    },
  ];

  // ==================================================
  // PAGE UI
  // ==================================================

  return (
    <div className="luma-page">
      {/* Page header */}
      <div className="luma-page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <div className="luma-page-header-icon" aria-hidden="true">
            <FiUsers size={22} />
          </div>

          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h4 mb-0 fw-semibold">Brands</h1>

              {!isLoading && !isError && (
                <span className="luma-count-badge">{totalElements}</span>
              )}
            </div>

            <p className="text-secondary mb-0">
              Manage the brands available across Luma &amp; Co.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="secondary"
            className="luma-btn-secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh brands"
            title="Refresh"
          >
            <FiRefreshCw size={16} className={isFetching ? "luma-spin" : ""} />
          </Button>

          <Button
            variant="primary"
            className="luma-btn-primary"
            onClick={() => openBrandModal(null)}
          >
            <FiPlus size={17} />
            Add Brand
          </Button>
        </div>
      </div>

      {/* Main card */}
      <div className="luma-card">
        {/* Toolbar */}
        <div className="d-flex flex-wrap align-items-center gap-2 p-3 border-bottom">
          <div className="luma-input-wrapper luma-toolbar-search">
            <FiSearch className="luma-input-icon" size={16} aria-hidden="true" />

            <input
              type="search"
              className="form-control luma-input"
              placeholder="Search brands by name…"
              aria-label="Search brands by name"
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 ms-auto">
            {appliedFilters.map((label) => (
              <span key={label} className="luma-filter-badge">
                {label}
              </span>
            ))}

            <Button
              variant="secondary"
              className="luma-btn-secondary"
              onClick={openFilterDrawer}
            >
              <FiFilter size={16} />
              Filters
              {appliedFilters.length > 0 && (
                <span className="badge bg-primary ms-2">{appliedFilters.length}</span>
              )}
            </Button>
          </div>
        </div>

        <DataTable<BrandResponse>
          columns={columns}
          data={brands}
          getRowKey={(brand) => brand.id}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          loadingMessage="Loading brands..."
          emptyTitle="No brands found"
          emptyMessage={
            search || appliedFilters.length > 0
              ? "No brands match your search or filters."
              : "There are currently no brands available."
          }
          onRetry={() => refetch()}
          renderEmptyIcon={<FiSearch size={18} />}
          renderErrorIcon={<>!</>}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={changePageSize}
          itemLabel="brands"
          isFetching={isFetching && !isLoading}
          onPageChange={changePage}
        />
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        title="Filter Brands"
        isLoading={isFetching}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApply={applyFilters}
        onReset={resetFilters}
      >
        <div className="mb-3">
          <label htmlFor="filter-brand-code" className="luma-filter-label">
            Code
          </label>

          <div className="position-relative">
            <input
              id="filter-brand-code"
              type="text"
              className="form-control luma-input pe-5"
              placeholder="Enter brand code"
              value={draftFilters.code}
              onChange={(event) => setDraftFilters({ ...draftFilters, code: event.target.value })}
            />

            {draftFilters.code && (
              <button
                type="button"
                className="btn btn-sm rounded-circle border border-danger text-danger d-flex align-items-center justify-content-center p-1 position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setDraftFilters({ ...draftFilters, code: "" })}
                aria-label="Clear brand code"
              >
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>

        <StatusFilterPicker
          value={draftFilters.status}
          onChange={(status) => setDraftFilters({ ...draftFilters, status })}
        />
      </FilterDrawer>

      {/* Add / edit modal */}
      <BrandFormModal
        show={showBrandModal}
        brand={editingBrand}
        isSubmitting={saveBrand.isPending}
        onClose={closeBrandModal}
        onSave={handleSaveBrand}
      />

      {/* Activate / deactivate confirmation */}
      <ConfirmModal
        isOpen={brandToToggle !== null}
        title={brandToToggle?.active ? "Deactivate Brand" : "Activate Brand"}
        message={
          brandToToggle
            ? `Are you sure you want to ${brandToToggle.active ? "deactivate" : "activate"} “${brandToToggle.name}”?`
            : ""
        }
        confirmText={brandToToggle?.active ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        isLoading={setBrandActive.isPending}
        onCancel={() => !setBrandActive.isPending && setBrandToToggle(null)}
        onConfirm={handleToggleBrand}
      />
    </div>
  );
}
