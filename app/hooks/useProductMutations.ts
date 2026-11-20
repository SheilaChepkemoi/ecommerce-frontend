"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  activateProduct,
  activateProductVariant,
  addProductVariant,
  createProduct,
  deactivateProduct,
  deactivateProductVariant,
  deleteProductImage,
  setPrimaryProductImage,
  updateProduct,
  updateProductVariant,
  uploadProductImage,
} from "@/app/lib/api/products";

import type { ProductRequest, ProductVariantRequest } from "@/app/types/products";

// Errors are toasted by the global handler in app/lib/queryClient.ts.

/**
 * After a change, mark product data as stale so it refetches:
 * the product lists ("products") and the product detail pages ("product").
 */
function useRefreshProducts() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["product"] }),
    ]);
}

// ----- Products -----

/** Create when there is no id, update when there is. */
export function useSaveProduct() {
  const refreshProducts = useRefreshProducts();

  return useMutation({
    mutationFn: ({ id, request }: { id?: number; request: ProductRequest }) =>
      id ? updateProduct(id, request) : createProduct(request),
    onSuccess: refreshProducts,
  });
}

/** Turn a product on (active: true) or off (active: false). */
export function useSetProductActive() {
  const refreshProducts = useRefreshProducts();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? activateProduct(id) : deactivateProduct(id),
    onSuccess: refreshProducts,
  });
}

// ----- Variants -----

/** Add a variant when there is no variantId, update it when there is. */
export function useSaveProductVariant() {
  const refreshProducts = useRefreshProducts();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      request,
    }: {
      productId: number;
      variantId?: number;
      request: ProductVariantRequest;
    }) =>
      variantId
        ? updateProductVariant(productId, variantId, request)
        : addProductVariant(productId, request),
    onSuccess: refreshProducts,
  });
}

/** Turn a variant on (active: true) or off (active: false). */
export function useSetProductVariantActive() {
  const refreshProducts = useRefreshProducts();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      active,
    }: {
      productId: number;
      variantId: number;
      active: boolean;
    }) =>
      active
        ? activateProductVariant(productId, variantId)
        : deactivateProductVariant(productId, variantId),
    onSuccess: refreshProducts,
  });
}

// ----- Images -----

export function useUploadProductImage() {
  const refreshProducts = useRefreshProducts();

  return useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      uploadProductImage(productId, file),
    onSuccess: refreshProducts,
  });
}

export function useSetPrimaryProductImage() {
  const refreshProducts = useRefreshProducts();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      setPrimaryProductImage(productId, imageId),
    onSuccess: refreshProducts,
  });
}

export function useDeleteProductImage() {
  const refreshProducts = useRefreshProducts();

  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      deleteProductImage(productId, imageId),
    onSuccess: refreshProducts,
  });
}
