"use client";

import { useQuery } from "@tanstack/react-query";

import { useBrands } from "@/app/hooks/useBrands";
import { useCategories } from "@/app/hooks/useCategories";
import { useProducts } from "@/app/hooks/useProducts";
import { getLowStockVariants } from "@/app/lib/api/products";

/**
 * REAL numbers for the dashboard, from the existing APIs.
 * The list endpoints return `totalElements`, so asking for page 0 is
 * enough to count everything.
 */
export function useCatalogueStats() {
  const activeProducts = useProducts({ page: 0, pageSize: 20, status: "active" });
  const outOfStock = useProducts({ page: 0, pageSize: 20, status: "active", inStock: false });
  const brands = useBrands({ page: 0, pageSize: 20, status: "active" });
  const categories = useCategories({ page: 0, pageSize: 20, status: "active" });

  // Under the "products" key, so any product change refreshes it too.
  const lowStock = useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: getLowStockVariants,
    meta: { errorDisplay: "inline" },
  });

  return {
    activeProducts: activeProducts.data?.totalElements,
    outOfStock: outOfStock.data?.totalElements,
    brands: brands.data?.totalElements,
    categories: categories.data?.totalElements,
    lowStockVariants: lowStock.data ?? [],
    isLoadingLowStock: lowStock.isLoading,
  };
}
