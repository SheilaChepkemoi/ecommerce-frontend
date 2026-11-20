
"use client";

import { useQuery } from "@tanstack/react-query";

import { getProductById } from "@/app/lib/api/products";

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: Number.isInteger(id) && id > 0,
    meta: {
      errorDisplay: "inline",
    },
  });
}
