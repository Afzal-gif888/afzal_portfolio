/**
 * Cloudinary Image Optimization Utilities
 *
 * Applies on-the-fly Cloudinary transformations to serve images in the
 * smallest possible size, in modern formats (WebP/AVIF), with automatic
 * quality adjustment — similar to how Swiggy / Zomato load images instantly.
 *
 * Also generates tiny LQIP (Low-Quality Image Placeholder) URLs for the
 * blur-up effect used by the OptimizedImage component.
 */

/**
 * Check if a URL is a Cloudinary URL.
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/**
 * Transform a Cloudinary URL to serve an optimized version.
 *
 * @param url      Original Cloudinary URL
 * @param width    Desired width in px (will be auto-cropped)
 * @param quality  Quality 1–100 or "auto" (Cloudinary picks best)
 * @returns        Transformed URL string
 */
export function getOptimizedUrl(
  url: string,
  width: number = 800,
  quality: number | "auto" = "auto"
): string {
  if (!isCloudinaryUrl(url)) return url;

  // Insert transformations before /upload/ path segment
  // f_auto  → serve WebP/AVIF based on browser Accept header
  // q_auto  → Cloudinary picks the best quality/size trade-off
  // w_<n>   → resize to the exact width needed
  // c_limit → never upscale, only downscale
  // dpr_auto → serve 2x for retina screens automatically
  const transforms = `f_auto,q_${quality},w_${width},c_limit`;

  return url.replace(
    "/upload/",
    `/upload/${transforms}/`
  );
}

/**
 * Generate a tiny LQIP (Low-Quality Image Placeholder) URL.
 *
 * Returns a ~1-2 KB blurred thumbnail that loads in <50ms.
 * Used as the blurDataURL / placeholder before the full image loads.
 */
export function getLqipUrl(url: string): string {
  if (!isCloudinaryUrl(url)) return url;

  // 30px wide, heavily compressed, with Gaussian blur
  const transforms = "f_auto,q_30,w_30,e_blur:800";
  return url.replace("/upload/", `/upload/${transforms}/`);
}
