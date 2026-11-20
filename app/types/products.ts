import type { StatusFilter } from "@/app/types/api";
import type { PaginatedResponse } from "@/app/types/pagination";

export interface ProductImageResponse {
  id: number;
  url: string;
  primary: boolean;
  displayOrder: number;
}

/** One size/colour of a product, with its own SKU, price and stock. */
export interface ProductVariantResponse {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  size: string | null;
  colour: string | null;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  lowStock: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantRequest {
  size: string | null;
  colour: string | null;
  price: number;
  stockQuantity: number;
  lowStockThreshold?: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  /** Lowest active variant price ("From KES ..."); null when no active variants. */
  minPrice: number | null;
  inStock: boolean;
  active: boolean;
  brandId: number;
  brandName: string;
  brandCode: string;
  categoryId: number;
  categoryName: string;
  subcategoryId: number | null;
  subcategoryName: string | null;
  createdAt: string;
  updatedAt: string;
  primaryImageUrl?: string | null;
  /** Only on the detail endpoints. */
  images?: ProductImageResponse[];
  /** Only on the detail endpoints. */
  variants?: ProductVariantResponse[];
}

export type ProductPageResponse = PaginatedResponse<ProductResponse>;

/**
 * Create: send variants (at least one).
 * Update: variants are ignored by the backend; manage them on the product page.
 */
export interface ProductRequest {
  name: string;
  description: string;
  brandId: number;
  categoryId: number;
  /** Optional; must belong to the category. */
  subcategoryId: number | null;
  variants?: ProductVariantRequest[];
}

export interface GetProductsParams {
  page: number;
  pageSize: number;
  search?: string;
  sku?: string;
  brandId?: number;
  categoryId?: number;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  /** Clothing/shoe size filter, e.g. "M". (?size= is the page size.) */
  variantSize?: string;
  colour?: string;
  inStock?: boolean;
  status?: StatusFilter;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
