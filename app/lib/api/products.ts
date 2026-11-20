
import { apiClient } from "@/app/lib/api/clients";
import { API_ENDPOINTS } from "@/app/lib/api/endpoints";

import type {
  ProductRequest,
  ProductResponse,
  ProductPageResponse,
  GetProductsParams,
  ProductImageResponse,
  ProductVariantRequest,
  ProductVariantResponse,
} from "@/app/types/products";

/**
 * Get paginated and filtered products.
 */
export function getProducts(
  {
    page,
    pageSize,
    search,
    sku,
    brandId,
    categoryId,
    subcategoryId,
    minPrice,
    maxPrice,
    variantSize,
    colour,
    inStock,
    status,
    sortBy,
    sortDirection,
  }: GetProductsParams,
  signal?: AbortSignal
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
  });

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  if (sku?.trim()) {
    params.set("sku", sku.trim());
  }

  if (brandId !== undefined) {
    params.set("brandId", String(brandId));
  }

  if (categoryId !== undefined) {
    params.set("categoryId", String(categoryId));
  }

  if (subcategoryId !== undefined) {
    params.set("subcategoryId", String(subcategoryId));
  }

  if (minPrice !== undefined) {
    params.set("minPrice", String(minPrice));
  }

  if (maxPrice !== undefined) {
    params.set("maxPrice", String(maxPrice));
  }

  if (variantSize?.trim()) {
    params.set("variantSize", variantSize.trim());
  }

  if (colour?.trim()) {
    params.set("colour", colour.trim());
  }

  if (inStock !== undefined) {
    params.set("inStock", String(inStock));
  }

  if (status) {
    params.set("status", status);
  }

  if (sortBy) {
    params.set("sortBy", sortBy);
  }

  if (sortDirection) {
    params.set("sortDirection", sortDirection);
  }

  return apiClient<ProductPageResponse>(
    `${API_ENDPOINTS.products.list}?${params.toString()}`,
    { signal }
  );
}

/**
 * Create a product.
 */
export function createProduct(request: ProductRequest) {
  return apiClient<ProductResponse>(
    API_ENDPOINTS.products.create,
    {
      method: "POST",
      body: request,
    }
  );
}

/**
 * Update a product.
 */
export function updateProduct(
  id: number,
  request: ProductRequest
) {
  return apiClient<ProductResponse>(
    API_ENDPOINTS.products.update(id),
    {
      method: "PUT",
      body: request,
    }
  );
}

/**
 * Activate a product.
 */
export function activateProduct(id: number) {
  return apiClient<void>(
    API_ENDPOINTS.products.activate(id),
    {
      method: "PATCH",
    }
  );
}

/**
 * Deactivate a product.
 */
export function deactivateProduct(id: number) {
  return apiClient<void>(
    API_ENDPOINTS.products.deactivate(id),
    {
      method: "PATCH",
    }
  );
}


export function uploadProductImage(
  productId: number,
  file: File
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ProductImageResponse>(
    API_ENDPOINTS.products.images.upload(productId),
    {
      method: "POST",
      body: formData,
    }
  );
}


export function getProductById(id: number) {
  return apiClient<ProductResponse>(
    API_ENDPOINTS.products.getById(id)
  );
}


export async function setPrimaryProductImage(
  productId: number,
  imageId: number
) {
  return apiClient(
    API_ENDPOINTS.products.images.setPrimary(productId, imageId),
    {
      method: "PATCH",
    }
  );
}

export async function deleteProductImage(
  productId: number,
  imageId: number
) {
  return apiClient(
    API_ENDPOINTS.products.images.delete(productId, imageId),
    {
      method: "DELETE",
    }
  );
}

// ==================================================
// VARIANTS (sizes / colours, each with price and stock)
// ==================================================

/** Active variants whose stock is at or below their low-stock threshold. */
export function getLowStockVariants() {
  return apiClient<ProductVariantResponse[]>(API_ENDPOINTS.products.lowStock);
}

export function addProductVariant(
  productId: number,
  request: ProductVariantRequest
) {
  return apiClient<ProductVariantResponse>(
    API_ENDPOINTS.products.variants.create(productId),
    { method: "POST", body: request }
  );
}

export function updateProductVariant(
  productId: number,
  variantId: number,
  request: ProductVariantRequest
) {
  return apiClient<ProductVariantResponse>(
    API_ENDPOINTS.products.variants.update(productId, variantId),
    { method: "PUT", body: request }
  );
}

export function activateProductVariant(productId: number, variantId: number) {
  return apiClient<void>(
    API_ENDPOINTS.products.variants.activate(productId, variantId),
    { method: "PATCH" }
  );
}

export function deactivateProductVariant(productId: number, variantId: number) {
  return apiClient<void>(
    API_ENDPOINTS.products.variants.deactivate(productId, variantId),
    { method: "PATCH" }
  );
}
