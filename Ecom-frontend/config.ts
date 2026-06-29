const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const config = {
  // Base URL of the ecom-starter backend (NestJS global prefix is /api).
  API_URL,
  // Backend origin without the /api prefix — used to load statically served
  // assets like product images (served at /images/*).
  ASSET_ORIGIN: API_URL.replace(/\/api\/?$/, ""),
  BASE_FE_URL: process.env.NEXT_PUBLIC_FE_URL || "http://localhost:3001",
};

/** Resolve a product image path (e.g. "/images/x.png") to an absolute URL. */
export const resolveImageUrl = (path?: string): string =>
  path ? (path.startsWith("http") ? path : `${config.ASSET_ORIGIN}${path}`) : "";
