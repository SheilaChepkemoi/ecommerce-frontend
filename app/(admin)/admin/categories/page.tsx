"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiChevronDown,
  FiChevronRight,
  FiFilter,
  FiLayers,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

import { useCategories } from "@/app/hooks/useCategories";
import {
  useSaveCategory,
  useSaveSubcategory,
  useSetCategoryActive,
  useSetSubcategoryActive,
} from "@/app/hooks/useCategoryMutations";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import { PAGE_SIZE_OPTIONS, usePagination } from "@/app/hooks/usePagination";
import { runSteps } from "@/app/lib/runSteps";

import type { StatusFilter } from "@/app/types/api";
import type {
  CategoryResponse,
  SubcategoryRequest,
  SubcategoryResponse,
} from "@/app/types/categories";

import CategoryFormModal, {
  type CategoryFormValues,
} from "@/components/admin/categories/CategoryForm";
import SubcategoryFormModal from "@/components/admin/categories/SubcategoryForm";
import Button from "@/components/shared/Button";
import ConfirmModal from "@/components/shared/ConfirmModal";
import DataTable from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import FilterDrawer from "@/components/shared/FilterDrawer";
import Pagination from "@/components/shared/Pagination";
import RowActions from "@/components/shared/RowActions";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusFilterPicker from "@/components/shared/StatusFilterPicker";

/** The category or subcategory waiting for "Are you sure?" before (de)activating. */
interface ItemToToggle {
  type: "category" | "subcategory";
  id: number;
  name: string;
  active: boolean;
}

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==================================================
  // STATE
  // ==================================================

  const { currentPage, pageSize, changePage, changePageSize, resetPage } = usePagination();

  // Search box. `search` is what's sent to the API, 400 ms after the
  // user stops typing. It matches category AND subcategory names.
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  // Status filter: active categories by default; the drawer shows inactive or all.
  const [status, setStatus] = useState<StatusFilter>("active");
  const [draftStatus, setDraftStatus] = useState<StatusFilter>("active");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Category modal (editingCategory = null means "adding")
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);

  // Subcategory modal (editingSubcategory = null means "adding")
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryResponse | null>(null);

  // Category to pre-select when adding a subcategory from inside a row
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState<number | null>(null);

  const [itemToToggle, setItemToToggle] = useState<ItemToToggle | null>(null);

  // Which categories are opened to show their subcategories
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  // ==================================================
  // DATA
  // ==================================================

  // Each category comes with all its subcategories inside (active and inactive).
  const { data, isLoading, isFetching, isError, error, refetch } = useCategories({
    page: currentPage - 1, // the backend counts pages from 0
    pageSize,
    name: search,
    status,
    sortBy: "name",
  });

  const categories = isError ? [] : (data?.content ?? []);
  const totalElements = isError ? 0 : (data?.totalElements ?? 0);
  const totalPages = isError ? 0 : (data?.totalPages ?? 0);

  const saveCategory = useSaveCategory();
  const setCategoryActive = useSetCategoryActive();
  const saveSubcategory = useSaveSubcategory();
  const setSubcategoryActive = useSetSubcategoryActive();

  // True while either form is saving (the category form can run several steps).
  const isSaving =
    saveCategory.isPending || saveSubcategory.isPending || setSubcategoryActive.isPending;

  // ==================================================
  // EFFECTS
  // ==================================================

  // Open the add modal from the header Create menu (?create=1).
  useEffect(() => {
    if (searchParams.get("create") === "1") {
      router.replace("/admin/categories");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingCategory(null);
      setShowCategoryForm(true);
    }
  }, [searchParams, router]);

  // ==================================================
  // HANDLERS: OPEN / CLOSE FORMS
  // ==================================================

  const openCategoryForm = (category: CategoryResponse | null) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const openSubcategoryForm = (
    subcategory: SubcategoryResponse | null,
    categoryId: number | null = null
  ) => {
    setEditingSubcategory(subcategory);
    setNewSubcategoryCategoryId(categoryId);
    setShowSubcategoryForm(true);
  };

  const closeForms = () => {
    if (isSaving) return;

    setShowCategoryForm(false);
    setShowSubcategoryForm(false);
    setEditingCategory(null);
    setEditingSubcategory(null);
  };

  // ==================================================
  // HANDLERS: EXPAND ROWS
  // ==================================================

  const toggleExpanded = (categoryId: number) => {
    setExpandedIds((ids) =>
      ids.includes(categoryId) ? ids.filter((id) => id !== categoryId) : [...ids, categoryId]
    );
  };

  // Open when clicked, or when the search matches one of its subcategories.
  const isExpanded = (category: CategoryResponse) =>
    expandedIds.includes(category.id) ||
    (search !== "" &&
      category.subcategories.some((sub) => sub.name.toLowerCase().includes(search.toLowerCase())));

  // ==================================================
  // HANDLERS: SAVE CATEGORY
  // ==================================================

  /**
   * Add: create the category first, then each subcategory tag.
   * Edit: update the category, then add / restore / remove subcategory tags.
   * The steps run one by one; a failed step doesn't stop the others.
   */
  const handleSaveCategory = async ({ name, description, subcategoryNames }: CategoryFormValues) => {
    const steps: (() => Promise<unknown>)[] = [];

    if (!editingCategory) {
      // The category must exist before subcategories can be added to it.
      let categoryId: number;

      try {
        const created = await saveCategory.mutateAsync({ request: { name, description } });
        categoryId = created.id;
      } catch {
        return; // error toast from the global handler; the form stays open
      }

      for (const subName of subcategoryNames) {
        steps.push(() =>
          saveSubcategory.mutateAsync({ request: { name: subName, description: null, categoryId } })
        );
      }
    } else {
      const categoryId = editingCategory.id;

      if (name !== editingCategory.name || description !== (editingCategory.description ?? null)) {
        steps.push(() => saveCategory.mutateAsync({ id: categoryId, request: { name, description } }));
      }

      const existing = editingCategory.subcategories;
      const wanted = subcategoryNames.map((subName) => subName.toLowerCase());

      // New tags, or removed ones typed again
      for (const subName of subcategoryNames) {
        const match = existing.find((sub) => sub.name.toLowerCase() === subName.toLowerCase());

        if (!match) {
          steps.push(() =>
            saveSubcategory.mutateAsync({ request: { name: subName, description: null, categoryId } })
          );
        } else if (!match.active) {
          steps.push(() => setSubcategoryActive.mutateAsync({ id: match.id, active: true }));
        }
      }

      // Tags removed with ×
      for (const sub of existing) {
        if (sub.active && !wanted.includes(sub.name.toLowerCase())) {
          steps.push(() => setSubcategoryActive.mutateAsync({ id: sub.id, active: false }));
        }
      }

      if (steps.length === 0) {
        toast("No changes to save.");
        return;
      }
    }

    const { failed } = await runSteps(steps);

    if (failed === 0) {
      toast.success(editingCategory ? "Changes saved successfully." : `${name} created.`);
    } else if (failed < steps.length) {
      toast.success(`${steps.length - failed} change(s) saved. ${failed} failed.`);
    }

    // Close so the list shows what was really saved; reopen to fix any failures.
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  // ==================================================
  // HANDLERS: SAVE SUBCATEGORY
  // ==================================================

  const handleSaveSubcategory = async (request: SubcategoryRequest) => {
    try {
      await saveSubcategory.mutateAsync({ id: editingSubcategory?.id, request });
      toast.success(editingSubcategory ? "Changes saved successfully." : `${request.name} created.`);

      setShowSubcategoryForm(false);
      setEditingSubcategory(null);
    } catch {
      // The error toast comes from the global handler. The form stays open.
    }
  };

  // ==================================================
  // HANDLERS: ACTIVATE / DEACTIVATE
  // ==================================================

  /** Runs after "Are you sure?" for a category or a subcategory. */
  const handleToggleItem = async () => {
    if (!itemToToggle) return;

    const { type, id, name, active } = itemToToggle;
    const setActive = type === "category" ? setCategoryActive : setSubcategoryActive;

    try {
      await setActive.mutateAsync({ id, active: !active });
      toast.success(`${name} ${active ? "deactivated" : "activated"}.`);
      setItemToToggle(null);
    } catch {
      // The error toast comes from the global handler.
    }
  };

  const isTogglingItem = setCategoryActive.isPending || setSubcategoryActive.isPending;

  // ==================================================
  // HANDLERS: STATUS FILTER
  // ==================================================

  const openFilterDrawer = () => {
    setDraftStatus(status); // start from what's applied now
    setIsFilterDrawerOpen(true);
  };

  const applyFilters = () => {
    setStatus(draftStatus);
    resetPage();
    setIsFilterDrawerOpen(false);
  };

  const resetFilters = () => {
    setDraftStatus("active");
    setStatus("active");
    resetPage();
  };

  // ==================================================
  // TABLE COLUMNS
  // ==================================================

  const columns: DataTableColumn<CategoryResponse>[] = [
    {
      key: "category",
      title: "Category",
      render: (category) => (
        <button
          type="button"
          className="cat-row-toggle"
          onClick={() => toggleExpanded(category.id)}
          aria-expanded={isExpanded(category)}
        >
          {isExpanded(category) ? <FiChevronDown /> : <FiChevronRight />}

          <div className="luma-avatar">{category.name.charAt(0).toUpperCase()}</div>

          <div className="text-start">
            <div className="luma-table-primary">{category.name}</div>
            {category.description && (
              <small className="text-secondary">{category.description}</small>
            )}
          </div>
        </button>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (category) => <StatusBadge active={category.active} />,
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-end",
      render: (category) => (
        <RowActions
          name={category.name}
          active={category.active}
          onEdit={() => openCategoryForm(category)}
          onToggle={() =>
            setItemToToggle({ type: "category", id: category.id, name: category.name, active: category.active })
          }
        />
      ),
    },
  ];

  /** The subcategory rows shown under an opened category. */
  const renderSubcategoryRows = (category: CategoryResponse) => {
    if (!isExpanded(category)) return null;

    return (
      <>
        {category.subcategories.map((sub) => (
          <tr key={`sub-${sub.id}`} className={`cat-sub-row ${sub.active ? "" : "is-inactive"}`}>
            <td>
              <div className="cat-sub-name">{sub.name}</div>
              {sub.description && <small className="text-secondary">{sub.description}</small>}
            </td>
            <td>
              <StatusBadge active={sub.active} />
            </td>
            <td>
              <RowActions
                name={sub.name}
                active={sub.active}
                onEdit={() => openSubcategoryForm(sub)}
                onToggle={() =>
                  setItemToToggle({ type: "subcategory", id: sub.id, name: sub.name, active: sub.active })
                }
              />
            </td>
          </tr>
        ))}

        <tr className="cat-sub-row">
          <td colSpan={3}>
            <button
              type="button"
              className="cat-sub-add"
              onClick={() => openSubcategoryForm(null, category.id)}
            >
              <FiPlus size={14} /> Add subcategory to {category.name}
            </button>
          </td>
        </tr>
      </>
    );
  };

  // ==================================================
  // PAGE UI
  // ==================================================

  return (
    <div className="luma-page">
      {/* Page header */}
      <div className="luma-page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <div className="luma-page-header-icon" aria-hidden="true">
            <FiLayers size={22} />
          </div>

          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h4 mb-0 fw-semibold">Categories</h1>

              {!isLoading && !isError && (
                <span className="luma-count-badge">{totalElements}</span>
              )}
            </div>

            <p className="text-secondary mb-0">
              Click a category to see its subcategories.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="secondary"
            className="luma-btn-secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh categories"
            title="Refresh"
          >
            <FiRefreshCw size={16} className={isFetching ? "luma-spin" : ""} />
          </Button>

          <Button
            variant="secondary"
            className="luma-btn-secondary"
            onClick={() => openSubcategoryForm(null)}
          >
            <FiPlus size={17} />
            Add Subcategory
          </Button>

          <Button
            variant="primary"
            className="luma-btn-primary"
            onClick={() => openCategoryForm(null)}
          >
            <FiPlus size={17} />
            Add Category
          </Button>
        </div>
      </div>

      {/* Main card */}
      <div className="luma-card">
        {/* Toolbar */}
        <div className="d-flex flex-wrap align-items-center gap-2 p-3 border-bottom">
          <div className="luma-input-wrapper luma-toolbar-search">
            <input
              type="search"
              className="form-control luma-input"
              placeholder="Search categories or subcategories…"
              aria-label="Search categories"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                resetPage(); // a new search starts from page 1
              }}
            />
          </div>

          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 ms-auto">
            {status !== "active" && (
              <span className="luma-filter-badge">
                Status: {status === "inactive" ? "Inactive" : "All"}
              </span>
            )}

            <Button variant="secondary" className="luma-btn-secondary" onClick={openFilterDrawer}>
              <FiFilter size={16} />
              Filters
              {status !== "active" && <span className="badge bg-primary ms-2">1</span>}
            </Button>
          </div>
        </div>

        <DataTable<CategoryResponse>
          columns={columns}
          data={categories}
          getRowKey={(category) => category.id}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          loadingMessage="Loading categories..."
          emptyTitle="No categories found"
          emptyMessage={
            search || status !== "active"
              ? "No categories match your search or filters."
              : "There are no categories yet. Click Add Category to create one."
          }
          onRetry={() => refetch()}
          renderSubRows={renderSubcategoryRows}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={changePageSize}
          itemLabel="categories"
          isFetching={isFetching && !isLoading}
          onPageChange={changePage}
        />
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        title="Filter Categories"
        isLoading={isFetching}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApply={applyFilters}
        onReset={resetFilters}
      >
        <StatusFilterPicker value={draftStatus} onChange={setDraftStatus} />
      </FilterDrawer>

      {/* Category form modal */}
      <CategoryFormModal
        show={showCategoryForm}
        category={editingCategory}
        isSubmitting={isSaving}
        onClose={closeForms}
        onSave={handleSaveCategory}
      />

      {/* Subcategory form modal */}
      <SubcategoryFormModal
        show={showSubcategoryForm}
        subcategory={editingSubcategory}
        defaultCategoryId={newSubcategoryCategoryId}
        isSubmitting={isSaving}
        onClose={closeForms}
        onSave={handleSaveSubcategory}
      />

      {/* Activate / deactivate confirmation */}
      <ConfirmModal
        isOpen={itemToToggle !== null}
        title={`${itemToToggle?.active ? "Deactivate" : "Activate"} ${
          itemToToggle?.type === "subcategory" ? "Subcategory" : "Category"
        }`}
        message={
          itemToToggle
            ? `Are you sure you want to ${itemToToggle.active ? "deactivate" : "activate"} “${itemToToggle.name}”?`
            : ""
        }
        confirmText={itemToToggle?.active ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        isLoading={isTogglingItem}
        onCancel={() => !isTogglingItem && setItemToToggle(null)}
        onConfirm={handleToggleItem}
      />
    </div>
  );
}
