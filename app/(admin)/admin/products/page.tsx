"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiFilter,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import Select from "react-select";
import toast from "react-hot-toast";

import Button from "@/components/shared/Button";
import DataTable from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import ConfirmModal from "@/components/shared/ConfirmModal";
import FilterDrawer from "@/components/shared/FilterDrawer";
import Pagination from "@/components/shared/Pagination";
import RowActions from "@/components/shared/RowActions";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusFilterPicker from "@/components/shared/StatusFilterPicker";
import ProductFormModal from "@/components/admin/products/ProductForm";

import { useBrands } from "@/app/hooks/useBrands";
import { useCategories } from "@/app/hooks/useCategories";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import { PAGE_SIZE_OPTIONS, usePagination } from "@/app/hooks/usePagination";
import { useProducts } from "@/app/hooks/useProducts";
import {
  useSaveProduct,
  useSetProductActive,
  useUploadProductImage,
} from "@/app/hooks/useProductMutations";
import { formatDate, formatPrice } from "@/app/lib/format";

import type { StatusFilter } from "@/app/types/api";
import type { ProductRequest, ProductResponse } from "@/app/types/products";

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "minPrice", label: "Price" },
  { value: "createdAt", label: "Date Created" },
];

/** The filters in the drawer. Name/description is searched from the toolbar. */
interface ProductFilters {
  sku: string;
  brandId: number | null;
  categoryId: number | null;
  minPrice: string;
  maxPrice: string;
  status: StatusFilter;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

const NO_FILTERS: ProductFilters = {
  sku: "",
  brandId: null,
  categoryId: null,
  minPrice: "",
  maxPrice: "",
  status: "active",
  sortBy: "",
  sortDirection: "asc",
};

// Lets the dropdown menus show above the drawer.
const selectStyles = {
  menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
  menu: (base: object) => ({ ...base, zIndex: 9999 }),
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================================================
  // STATE
  // ==================================================

  const { currentPage, pageSize, changePage, changePageSize, resetPage } = usePagination();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);


  const [filters, setFilters] = useState<ProductFilters>(NO_FILTERS);
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(NO_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Add modal. (Editing has its own page: /admin/products/[id]/edit.)
  const [showProductModal, setShowProductModal] = useState(false);

  // A product that was created, but some of its images failed to upload.
  // Saving again updates this product instead of creating a duplicate.
  const [savedProductForRetry, setSavedProductForRetry] = useState<ProductResponse | null>(null);

  // The product waiting for "Are you sure?" before (de)activating
  const [productToToggle, setProductToToggle] = useState<ProductResponse | null>(null);

  // ==================================================
  // DATA
  // ==================================================

  const { data, isLoading, isFetching, isError, error, refetch } = useProducts({
    page: currentPage - 1, // the backend counts pages from 0
    pageSize,
    search: search || undefined,
    sku: filters.sku || undefined,
    brandId: filters.brandId ?? undefined,
    categoryId: filters.categoryId ?? undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    status: filters.status,
    sortBy: filters.sortBy || undefined,
    sortDirection: filters.sortBy ? filters.sortDirection : undefined,
  });

  const products = isError ? [] : (data?.content ?? []);
  const totalElements = isError ? 0 : (data?.totalElements ?? 0);
  const totalPages = isError ? 0 : (data?.totalPages ?? 0);

  // Active brands and categories for the dropdowns
  const { data: brandsData, isLoading: isLoadingBrands } = useBrands({ page: 0, pageSize: 100, status: "active" });
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories({ page: 0, pageSize: 100, status: "active" });

  const brands = brandsData?.content ?? [];
  const categories = categoriesData?.content ?? [];

  const brandOptions = brands.map((brand) => ({ value: brand.id, label: brand.name }));
  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }));

  const saveProduct = useSaveProduct();
  const setProductActive = useSetProductActive();
  const uploadProductImage = useUploadProductImage();

  const isSaving = saveProduct.isPending || uploadProductImage.isPending;

  // Labels for the filter chips next to the Filters button
  const appliedFilters: string[] = [];
  if (filters.sku) appliedFilters.push(`SKU: ${filters.sku}`);
  if (filters.brandId) {
    appliedFilters.push(`Brand: ${brands.find((b) => b.id === filters.brandId)?.name ?? filters.brandId}`);
  }
  if (filters.categoryId) {
    appliedFilters.push(`Category: ${categories.find((c) => c.id === filters.categoryId)?.name ?? filters.categoryId}`);
  }
  if (filters.minPrice) appliedFilters.push(`Min: ${formatPrice(Number(filters.minPrice))}`);
  if (filters.maxPrice) appliedFilters.push(`Max: ${formatPrice(Number(filters.maxPrice))}`);
  if (filters.status !== "active") {
    appliedFilters.push(`Status: ${filters.status === "inactive" ? "Inactive" : "All"}`);
  }
  if (filters.sortBy) {
    const sortLabel = SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label;
    appliedFilters.push(`Sort: ${sortLabel} (${filters.sortDirection.toUpperCase()})`);
  }

  // ==================================================
  // EFFECTS
  // ==================================================

  // Open the add modal from the header Create menu (?create=1).
  useEffect(() => {
    if (searchParams.get("create") === "1") {
      router.replace("/admin/products");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedProductForRetry(null);
      setShowProductModal(true);
    }
  }, [searchParams, router]);

  // ==================================================
  // HANDLERS: ADD
  // ==================================================

  const openProductModal = () => {
    setSavedProductForRetry(null);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    if (isSaving) return;

    setShowProductModal(false);
    setSavedProductForRetry(null);
  };

  /**
   * Saves the product, then uploads its images one by one.
   * Returns the images that failed, so the form keeps only those.
   */
  const handleSaveProduct = async (request: ProductRequest, files: File[]): Promise<File[]> => {
    let product: ProductResponse;

    try {
      product = await saveProduct.mutateAsync({ id: savedProductForRetry?.id, request });
    } catch {
      // The error toast comes from the global handler.
      // Return all files so the user doesn't have to pick them again.
      return files;
    }

    const failedFiles: File[] = [];

    for (const file of files) {
      try {
        await uploadProductImage.mutateAsync({ productId: product.id, file });
      } catch {
        failedFiles.push(file);
      }
    }

    if (failedFiles.length > 0) {
      setSavedProductForRetry(product);
      toast.error(`${failedFiles.length} image(s) could not be uploaded. Save again to retry.`);
      return failedFiles;
    }

    toast.success("Product created successfully.");
    setShowProductModal(false);
    setSavedProductForRetry(null);
    return [];
  };

  // ==================================================
  // HANDLERS: ACTIVATE / DEACTIVATE
  // ==================================================

  const handleToggleProduct = async () => {
    if (!productToToggle) return;

    const { id, name, active } = productToToggle;

    try {
      await setProductActive.mutateAsync({ id, active: !active });
      toast.success(`${name} ${active ? "deactivated" : "activated"}.`);
      setProductToToggle(null);
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
    const min = draftFilters.minPrice === "" ? null : Number(draftFilters.minPrice);
    const max = draftFilters.maxPrice === "" ? null : Number(draftFilters.maxPrice);

    if ((min !== null && min < 0) || (max !== null && max < 0)) {
      toast.error("Price cannot be negative.");
      return;
    }

    if (min !== null && max !== null && min > max) {
      toast.error("Minimum price cannot exceed maximum price.");
      return;
    }

    setFilters({ ...draftFilters, sku: draftFilters.sku.trim() });
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

  const columns: DataTableColumn<ProductResponse>[] = [
    {
      key: "product",
      title: "Product",
      render: (product) => (
        <div>
          <div className="luma-table-primary">{product.name}</div>
          <Link
            href={`/admin/products/${product.id}`}
            className="luma-code text-decoration-none"
            title={`View ${product.name}`}
          >
            {product.sku}
          </Link>
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (product) => (
        <span
          className="luma-table-primary d-block w-100"
          style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}
        >
          {product.description}
        </span>
      ),
    },
    {
      key: "brand",
      title: "Brand",
      render: (product) => <span className="luma-table-primary">{product.brandName}</span>,
    },
    {
      key: "category",
      title: "Category",
      render: (product) => (
        <span className="luma-table-primary">
          {product.categoryName}
          {product.subcategoryName && (
            <span className="text-secondary"> › {product.subcategoryName}</span>
          )}
        </span>
      ),
    },
    {
      key: "price",
      title: "Price (from)",
      render: (product) => (
        <span className="luma-table-primary fw-medium">{formatPrice(product.minPrice)}</span>
      ),
    },
    {
      key: "stock",
      title: "Stock",
      render: (product) => (
        <span className={product.inStock ? "text-success fw-medium" : "text-danger fw-medium"}>
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (product) => <StatusBadge active={product.active} />,
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (product) => <span className="luma-table-primary">{formatDate(product.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      title: "Updated At",
      render: (product) => <span className="luma-table-primary">{formatDate(product.updatedAt)}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-end",
      render: (product) => (
        <RowActions
          name={product.name}
          active={product.active}
          onEdit={() => router.push(`/admin/products/${product.id}/edit`)}
          onToggle={() => setProductToToggle(product)}
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
            <FiPackage size={22} />
          </div>

          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h4 mb-0 fw-semibold">Products</h1>

              {!isLoading && !isError && (
                <span className="luma-count-badge">{totalElements}</span>
              )}
            </div>

            <p className="text-secondary mb-0">
              Manage the products available across Luma &amp; Co.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="secondary"
            className="luma-btn-secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh products"
            title="Refresh"
          >
            <FiRefreshCw size={16} className={isFetching ? "luma-spin" : ""} />
          </Button>

          <Button variant="primary" className="luma-btn-primary" onClick={openProductModal}>
            <FiPlus size={17} />
            Add Product
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
              placeholder="Search products…"
              aria-label="Search products by name or description"
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

            <Button variant="secondary" className="luma-btn-secondary" onClick={openFilterDrawer}>
              <FiFilter size={16} />
              Filters
              {appliedFilters.length > 0 && (
                <span className="badge bg-primary ms-2">{appliedFilters.length}</span>
              )}
            </Button>
          </div>
        </div>

        <DataTable<ProductResponse>
          columns={columns}
          data={products}
          getRowKey={(product) => product.id}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          loadingMessage="Loading products..."
          emptyTitle="No products found"
          emptyMessage={
            search || appliedFilters.length > 0
              ? "No products match your search or filters."
              : "There are currently no products available."
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
          itemLabel="products"
          isFetching={isFetching && !isLoading}
          onPageChange={changePage}
        />
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        title="Filter Products"
        isLoading={isFetching}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApply={applyFilters}
        onReset={resetFilters}
      >
        {/* SKU */}
        <div className="mb-3">
          <label htmlFor="filter-product-sku" className="luma-filter-label">
            SKU
          </label>

          <div className="position-relative">
            <input
              id="filter-product-sku"
              type="text"
              className="form-control luma-input pe-5"
              placeholder="Enter product SKU"
              value={draftFilters.sku}
              onChange={(event) => setDraftFilters({ ...draftFilters, sku: event.target.value })}
            />

            {draftFilters.sku && (
              <button
                type="button"
                className="btn btn-sm rounded-circle border border-danger text-danger d-flex align-items-center justify-content-center p-1 position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setDraftFilters({ ...draftFilters, sku: "" })}
                aria-label="Clear SKU"
              >
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Brand */}
        <div className="mb-3">
          <label className="luma-filter-label d-block">Brand</label>
          <Select
            options={brandOptions}
            value={brandOptions.find((option) => option.value === draftFilters.brandId) ?? null}
            onChange={(option) => setDraftFilters({ ...draftFilters, brandId: option?.value ?? null })}
            placeholder={isLoadingBrands ? "Loading brands..." : "Search or select a brand..."}
            isClearable
            isLoading={isLoadingBrands}
            noOptionsMessage={() => "No matching brands"}
            classNamePrefix="luma-select"
            styles={selectStyles}
            menuPosition="fixed"
          />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="luma-filter-label d-block">Category</label>
          <Select
            options={categoryOptions}
            value={categoryOptions.find((option) => option.value === draftFilters.categoryId) ?? null}
            onChange={(option) => setDraftFilters({ ...draftFilters, categoryId: option?.value ?? null })}
            placeholder={isLoadingCategories ? "Loading categories..." : "Search or select a category..."}
            isClearable
            isLoading={isLoadingCategories}
            noOptionsMessage={() => "No matching categories"}
            classNamePrefix="luma-select"
            styles={selectStyles}
            menuPosition="fixed"
          />
        </div>

        {/* Price range */}
        <div className="mb-3">
          <label className="luma-filter-label d-block">Price Range (KES)</label>

          <div className="row g-2">
            <div className="col-6">
              <input
                type="number"
                className="form-control luma-input"
                placeholder="Min price"
                min="0"
                value={draftFilters.minPrice}
                onChange={(event) => setDraftFilters({ ...draftFilters, minPrice: event.target.value })}
              />
            </div>

            <div className="col-6">
              <input
                type="number"
                className="form-control luma-input"
                placeholder="Max price"
                min="0"
                value={draftFilters.maxPrice}
                onChange={(event) => setDraftFilters({ ...draftFilters, maxPrice: event.target.value })}
              />
            </div>
          </div>
        </div>

        <StatusFilterPicker
          value={draftFilters.status}
          onChange={(status) => setDraftFilters({ ...draftFilters, status })}
        />

        {/* Sorting */}
        <div className="mb-3">
          <label htmlFor="filter-product-sort" className="luma-filter-label">
            Sort By
          </label>

          <select
            id="filter-product-sort"
            className="form-select luma-input"
            value={draftFilters.sortBy}
            onChange={(event) => setDraftFilters({ ...draftFilters, sortBy: event.target.value })}
          >
            <option value="">Default sorting</option>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {draftFilters.sortBy && (
          <div className="mb-3">
            <label htmlFor="filter-product-sort-direction" className="luma-filter-label">
              Sort Direction
            </label>

            <select
              id="filter-product-sort-direction"
              className="form-select luma-input"
              value={draftFilters.sortDirection}
              onChange={(event) =>
                setDraftFilters({ ...draftFilters, sortDirection: event.target.value as "asc" | "desc" })
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        )}
      </FilterDrawer>

      {/* Add modal (product = null: this modal only creates products) */}
      <ProductFormModal
        show={showProductModal}
        product={null}
        brands={brands}
        categories={categories}
        isSubmitting={isSaving}
        onClose={closeProductModal}
        onSave={handleSaveProduct}
      />

      {/* Activate / deactivate confirmation */}
      <ConfirmModal
        isOpen={productToToggle !== null}
        title={productToToggle?.active ? "Deactivate Product" : "Activate Product"}
        message={
          productToToggle
            ? `Are you sure you want to ${productToToggle.active ? "deactivate" : "activate"} “${productToToggle.name}”?`
            : ""
        }
        confirmText={productToToggle?.active ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        isLoading={setProductActive.isPending}
        onCancel={() => !setProductActive.isPending && setProductToToggle(null)}
        onConfirm={handleToggleProduct}
      />
    </div>
  );
}
