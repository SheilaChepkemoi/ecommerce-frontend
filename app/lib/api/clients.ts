
import axios, { type AxiosRequestConfig } from "axios";

import type { ApiResponse } from "@/app/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
}

/**
 * Standard error returned by our API client.
 */
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Default messages used when the backend
 * does not provide an error message.
 */
const DEFAULT_MESSAGES: Record<number, string> = {
  400: "The request was invalid.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do this.",
  404: "The requested resource was not found.",
  409: "The request conflicts with existing data.",
  422: "Please check the information you provided.",
  500: "The server ran into a problem. Please try again later.",
  502: "The server is temporarily unavailable.",
  503: "The service is temporarily unavailable.",
};

/**
 * Extract a backend error message safely.
 */
function getBackendErrorMessage(data: unknown): string | undefined {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data
  ) {
    const message = (data as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return undefined;
}

/**
 * Axios instance shared by all API requests.
 */
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Response interceptor.
 *
 * Successful HTTP responses pass through.
 * Failed HTTP responses are converted into ApiError.
 */
axiosClient.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    // A cancelled request should not be displayed as an error.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const backendMessage = getBackendErrorMessage(
        error.response?.data
      );

      const message =
        backendMessage ||
        (status
          ? DEFAULT_MESSAGES[status] ||
            "An unexpected error occurred."
          : "Unable to reach the server. Please check your connection.");

      return Promise.reject(new ApiError(message, status));
    }

    return Promise.reject(
      new ApiError("An unexpected error occurred.")
    );
  }
);

/**
 * API request options.
 *
 * Uses `body` to preserve your existing API function signatures.
 */
type RequestOptions = Omit<
  AxiosRequestConfig,
  "url" | "data" | "baseURL"
> & {
  body?: unknown;
};

/**
 * Main API client.
 *
 * Sends requests using Axios and returns the payload
 * from the Spring Boot response envelope.
 */
export async function apiClient<T>(
  endpoint: string,
  { body, ...options }: RequestOptions = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" &&
    body instanceof FormData;

  const isRaw = isFormData || typeof body === "string";

  // Errors from axios are already turned into ApiError by the
  // interceptor above, so they simply pass through to the caller.
  const response = await axiosClient.request<ApiResponse<T>>({
    ...options,
    url: endpoint,
    data: body,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && !isRaw
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  const data = response.data;

  // Handle application-level errors, including HTTP 200
  // responses where the backend reports WARNING or ERROR.
  if (!data || data.responseType !== "SUCCESS") {
    throw new ApiError(
      data?.message || "The request could not be completed.",
      response.status
    );
  }

  return data.payload as T;
}
