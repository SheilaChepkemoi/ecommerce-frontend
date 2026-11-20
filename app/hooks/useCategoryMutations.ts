"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  activateCategory,
  activateSubcategory,
  createCategory,
  createSubcategory,
  deactivateCategory,
  deactivateSubcategory,
  updateCategory,
  updateSubcategory,
} from "@/app/lib/api/categories";

import type { CategoryRequest, SubcategoryRequest } from "@/app/types/categories";

// Errors are toasted by the global handler in app/lib/queryClient.ts.
// Subcategories live inside the category list, so every change here
// refreshes the "categories" queries.

/** After a change, mark the category lists as stale so they refetch. */
function useRefreshCategories() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: ["categories"] });
}

// ----- Categories -----

/** Create when there is no id, update when there is. */
export function useSaveCategory() {
  const refreshCategories = useRefreshCategories();

  return useMutation({
    mutationFn: ({ id, request }: { id?: number; request: CategoryRequest }) =>
      id ? updateCategory(id, request) : createCategory(request),
    onSuccess: refreshCategories,
  });
}

/** Turn a category on (active: true) or off (active: false). */
export function useSetCategoryActive() {
  const refreshCategories = useRefreshCategories();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? activateCategory(id) : deactivateCategory(id),
    onSuccess: refreshCategories,
  });
}

// ----- Subcategories -----

/** Create when there is no id, update when there is. */
export function useSaveSubcategory() {
  const refreshCategories = useRefreshCategories();

  return useMutation({
    mutationFn: ({ id, request }: { id?: number; request: SubcategoryRequest }) =>
      id ? updateSubcategory(id, request) : createSubcategory(request),
    onSuccess: refreshCategories,
  });
}

/** Turn a subcategory on (active: true) or off (active: false). */
export function useSetSubcategoryActive() {
  const refreshCategories = useRefreshCategories();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? activateSubcategory(id) : deactivateSubcategory(id),
    onSuccess: refreshCategories,
  });
}
