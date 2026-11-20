export const DEFAULT_FETCH_ERROR = "Failed to fetch";

/**
 * Returns the message carried by an error (for example the message your
 * backend sent, stored on your API error class), or the fallback when
 * there isn't a usable one.
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_FETCH_ERROR
): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}