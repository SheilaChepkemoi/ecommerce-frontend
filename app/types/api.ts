export type ResponseType =
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export interface ApiResponse<T> {
  responseType: ResponseType;
  generatedId: number | null;
  generatedCode: string | null;
  payload: T;
  exceptionClass: string | null;
  message: string;
  errorCode: string | null;
  messageTracker: number | null;
}

/** Admin list filter shared by products, categories and brands. */
export type StatusFilter = "active" | "inactive" | "all";
