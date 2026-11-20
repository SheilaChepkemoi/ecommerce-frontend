"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { useState } from "react";

import { createQueryClient } from "@/app/lib/queryClient";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({
  children,
}: QueryProviderProps) {
  // One client for the whole app, with the global settings and
  // error toasts from app/lib/queryClient.ts.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}