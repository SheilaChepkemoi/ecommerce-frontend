"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  activateBrand,
  createBrand,
  deactivateBrand,
  updateBrand,
} from "@/app/lib/api/brands";

import type { BrandRequest } from "@/app/types/brands";

// Errors are toasted by the global handler in app/lib/queryClient.ts.

/** After a change, mark the brand lists as stale so they refetch. */
function useRefreshBrands() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: ["brands"] });
}

/** Create when there is no id, update when there is. */
export function useSaveBrand() {
  const refreshBrands = useRefreshBrands();

  return useMutation({
    mutationFn: ({ id, request }: { id?: number; request: BrandRequest }) =>
      id ? updateBrand(id, request) : createBrand(request),
    onSuccess: refreshBrands,
  });
}

/** Turn a brand on (active: true) or off (active: false). */
export function useSetBrandActive() {
  const refreshBrands = useRefreshBrands();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? activateBrand(id) : deactivateBrand(id),
    onSuccess: refreshBrands,
  });
}
