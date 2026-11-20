/**
 * Admin endpoints (create, edit, any status) live under /api/admin.
 * Public storefront endpoints (read-only, active only) live under /api.
 */
export const API_ENDPOINTS = {
  brands: {
    list: "/api/admin/brands",
    getById: (id: number) => `/api/admin/brands/${id}`,
    create: "/api/admin/brands",
    update: (id: number) => `/api/admin/brands/${id}`,
    activate: (id: number) => `/api/admin/brands/${id}/activate`,
    deactivate: (id: number) => `/api/admin/brands/${id}/deactivate`,
  },

  categories: {
    list: "/api/admin/categories",
    getById: (id: number) => `/api/admin/categories/${id}`,
    create: "/api/admin/categories",
    update: (id: number) => `/api/admin/categories/${id}`,
    activate: (id: number) => `/api/admin/categories/${id}/activate`,
    deactivate: (id: number) => `/api/admin/categories/${id}/deactivate`,
  },

  subcategories: {
    getById: (id: number) => `/api/admin/subcategories/${id}`,
    create: "/api/admin/subcategories",
    update: (id: number) => `/api/admin/subcategories/${id}`,
    activate: (id: number) => `/api/admin/subcategories/${id}/activate`,
    deactivate: (id: number) => `/api/admin/subcategories/${id}/deactivate`,
  },

  products: {
    list: "/api/admin/products",
    getById: (id: number) => `/api/admin/products/${id}`,
    create: "/api/admin/products",
    update: (id: number) => `/api/admin/products/${id}`,
    activate: (id: number) => `/api/admin/products/${id}/activate`,
    deactivate: (id: number) => `/api/admin/products/${id}/deactivate`,
    lowStock: "/api/admin/products/low-stock",

    images: {
      list: (productId: number) => `/api/admin/products/${productId}/images`,
      upload: (productId: number) => `/api/admin/products/${productId}/images`,
      setPrimary: (productId: number, imageId: number) =>
        `/api/admin/products/${productId}/images/${imageId}/primary`,
      delete: (productId: number, imageId: number) =>
        `/api/admin/products/${productId}/images/${imageId}`,
    },

    variants: {
      list: (productId: number) => `/api/admin/products/${productId}/variants`,
      create: (productId: number) => `/api/admin/products/${productId}/variants`,
      update: (productId: number, variantId: number) =>
        `/api/admin/products/${productId}/variants/${variantId}`,
      activate: (productId: number, variantId: number) =>
        `/api/admin/products/${productId}/variants/${variantId}/activate`,
      deactivate: (productId: number, variantId: number) =>
        `/api/admin/products/${productId}/variants/${variantId}/deactivate`,
    },
  },

  // Storefront (public). Not used yet: for the shop pages.
  shop: {
    products: "/api/products",
    productBySlug: (slug: string) => `/api/products/slug/${slug}`,
    brands: "/api/brands",
    categories: "/api/categories",
    categoryBySlug: (slug: string) => `/api/categories/slug/${slug}`,
  },
} as const;
