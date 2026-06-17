"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { getOptimizedUrl, getLqipUrl, isCloudinaryUrl, sanitizeUrl } from "@/lib/cloudinary";

interface OptimizedImageProps extends Omit<ImageProps, "src" | "onLoad"> {
  src: string;
  /** Desired render width — used for Cloudinary resize. Defaults to 800. */
  optimizedWidth?: number;
}

/**
 * A drop-in replacement for next/image that:
 *  1. Rewrites Cloudinary URLs to serve WebP/AVIF at the exact size needed
 *  2. Shows a tiny blurred LQIP placeholder while the full image loads
 *  3. Fades in the full-res image once loaded (blur-up effect)
 *
 * For non-Cloudinary URLs it behaves identically to next/image.
 */
export default function OptimizedImage({
  src,
  optimizedWidth = 800,
  className = "",
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Clean up the URL from Firestore – removes stray quotes/escapes that cause malformed URLs
  const cleanSrc = sanitizeUrl(src);
  const optimizedSrc = isCloudinaryUrl(cleanSrc)
    ? getOptimizedUrl(cleanSrc, optimizedWidth)
    : cleanSrc;

  const lqipSrc = isCloudinaryUrl(cleanSrc) ? getLqipUrl(cleanSrc) : undefined;

  // Log URLs in production to help trace any malformed URLs causing 502 errors
  if (process.env.NODE_ENV === "production") {
    console.log("[OptimizedImage] original src:", src);
    console.log("[OptimizedImage] cleaned src:", cleanSrc);
    console.log("[OptimizedImage] optimized src:", optimizedSrc);
  }

  return (
    <div className="relative w-full h-full">
      {/* LQIP blurred background — visible immediately */}
      {lqipSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lqipSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Full-quality image — fades in on load */}
      <Image
        {...props}
        alt={props.alt || ""}
        src={optimizedSrc}
        className={`${className} transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ ...props.style, zIndex: 1, ...(props.fill ? {} : { position: "relative" }) }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
