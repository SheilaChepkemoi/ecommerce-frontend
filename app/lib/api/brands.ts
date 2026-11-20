
import { apiClient } from "@/app/lib/api/clients";
import { API_ENDPOINTS } from "@/app/lib/api/endpoints";

import type {
  BrandRequest,
  BrandResponse,
} from "@/app/types/brands";

import type { StatusFilter } from "@/app/types/api";
import type { PaginatedResponse } from "@/app/types/pagination";

export interface GetBrandsParams {
  page: number;
  pageSize: number;
  name?: string;
  code?: string;
  status?: StatusFilter;
}


export function getBrands(
  { page, pageSize, name, code, status }: GetBrandsParams,
  signal?: AbortSignal
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
  });

  if (name?.trim()) {
    params.set("name", name.trim());
  }

  if (code?.trim()) {
    params.set("code", code.trim());
  }

  if (status) {
    params.set("status", status);
  }
//   if (status && status !== "all") {
//   params.set("status", status);
// }

  return apiClient<PaginatedResponse<BrandResponse>>(
    `${API_ENDPOINTS.brands.list}?${params.toString()}`,
    { signal }
  );
}

/**
 * Create a brand.
 */
export function createBrand(request: BrandRequest) {
  return apiClient<BrandResponse>(
    API_ENDPOINTS.brands.create,
    {
      method: "POST",
      body: request,
    }
  );
}

/**
 * Update a brand.
 */
export function updateBrand(
  id: number,
  request: BrandRequest
) {
  return apiClient<BrandResponse>(
    API_ENDPOINTS.brands.update(id),
    {
      method: "PUT",
      body: request,
    }
  );
}

/**
 * Activate a brand.
 */
export function activateBrand(id: number) {
  return apiClient<void>(
    API_ENDPOINTS.brands.activate(id),
    {
      method: "PATCH",
    }
  );
}

/**
 * Deactivate a brand.
 */
export function deactivateBrand(id: number) {
  return apiClient<void>(
    API_ENDPOINTS.brands.deactivate(id),
    {
      method: "PATCH",
    }
  );
}
