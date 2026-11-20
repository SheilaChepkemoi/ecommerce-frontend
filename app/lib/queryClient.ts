
import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

import { getErrorMessage } from "@/app/lib/getErrorMessage";

/**
 * Global query and mutation error handling.
 */
export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Skip toast for queries displaying errors inline.
        if (query.meta?.errorDisplay === "inline") {
          return;
        }

        const message = getErrorMessage(error);

        toast.error(message, {
          id: message,
        });
      },
    }),

    mutationCache: new MutationCache({
      onError: (error) => {
        const message = getErrorMessage(error);

        toast.error(message, {
          id: message,
        });
      },
    }),

    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
        // Admin data rarely changes behind your back, so don't refetch
        // every time you switch back to this browser tab.
        refetchOnWindowFocus: false,
      },
    },
  });
}
