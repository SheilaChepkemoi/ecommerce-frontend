/**
 * The backend returns image paths like "/images/products/7/abc.jpg".
 * Images are served by Spring (port 8081), not by Next.js, so prefix
 * relative paths with the API base URL.
 */
export function getImageUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}
