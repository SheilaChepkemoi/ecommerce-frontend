
import { apiClient } from "@/app/lib/api/clients";
import { API_ENDPOINTS } from "@/app/lib/api/endpoints";

import type {
  CategoryRequest,
  CategoryResponse,
  SubcategoryRequest,
  SubcategoryResponse,
} from "@/app/types/categories";
import type { StatusFilter } from "@/app/types/api";
import type { PaginatedResponse } from "@/app/types/pagination";

export interface GetCategoriesParams {
  page: number;
  pageSize: number;
  /** Leave out for active only (backend default). */
  status?: StatusFilter;
  name?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export async function getCategories(
  {
    page,
    pageSize,
    status,
    name,
    sortBy,
    sortDirection,
  }: GetCategoriesParams,
  signal?: AbortSignal
): Promise<PaginatedResponse<CategoryResponse>> {
  const params = new URLSearchParams();

  params.set("page", page.toString());
  params.set("size", pageSize.toString());

  if (name?.trim()) {
    params.set("name", name.trim());
  }

  if (status) {
    params.set("status", status);
  }

  if (sortBy) {
    params.set("sortBy", sortBy);
    params.set("sortDirection", sortDirection ?? "asc");
  }

  return apiClient<PaginatedResponse<CategoryResponse>>(
    `${API_ENDPOINTS.categories.list}?${params.toString()}`,
    { signal }
  );
}

export async function getCategory(
  id: number
): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>(
    API_ENDPOINTS.categories.getById(id)
  );
}

export async function createCategory(
  request: CategoryRequest
): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>(
    API_ENDPOINTS.categories.create,
    {
      method: "POST",
      body: request,
    }
  );
}

export async function updateCategory(
  id: number,
  request: CategoryRequest
): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>(
    API_ENDPOINTS.categories.update(id),
    {
      method: "PUT",
      body: request,
    }
  );
}

export async function activateCategory(id: number): Promise<void> {
  await apiClient<void>(
    API_ENDPOINTS.categories.activate(id),
    {
      method: "PATCH",
    }
  );
}

export async function deactivateCategory(id: number): Promise<void> {
  await apiClient<void>(
    API_ENDPOINTS.categories.deactivate(id),
    {
      method: "PATCH",
    }
  );
}

// ==================================================
// SUBCATEGORIES
// (listed inside each category, so no list call here)
// ==================================================

export async function createSubcategory(
  request: SubcategoryRequest
): Promise<SubcategoryResponse> {
  return apiClient<SubcategoryResponse>(
    API_ENDPOINTS.subcategories.create,
    {
      method: "POST",
      body: request,
    }
  );
}

export async function updateSubcategory(
  id: number,
  request: SubcategoryRequest
): Promise<SubcategoryResponse> {
  return apiClient<SubcategoryResponse>(
    API_ENDPOINTS.subcategories.update(id),
    {
      method: "PUT",
      body: request,
    }
  );
}

export async function activateSubcategory(id: number): Promise<void> {
  await apiClient<void>(
    API_ENDPOINTS.subcategories.activate(id),
    {
      method: "PATCH",
    }
  );
}

export async function deactivateSubcategory(id: number): Promise<void> {
  await apiClient<void>(
    API_ENDPOINTS.subcategories.deactivate(id),
    {
      method: "PATCH",
    }
  );
}
