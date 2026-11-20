export interface SubcategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  categoryName: string;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  /** Admin list: all of them. Storefront: active only. */
  subcategories: SubcategoryResponse[];
}

export interface CategoryRequest {
  name: string;
  description: string | null;
}

export interface SubcategoryRequest {
  name: string;
  description: string | null;
  categoryId: number;
}
