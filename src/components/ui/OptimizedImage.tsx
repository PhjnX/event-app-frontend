import { useState } from "react";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string; // ✅ THÊM PROP NÀY
  priority?: boolean;
  fallback?: string;
  onClick?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  imgClassName = "", // ✅ THÊM DEFAULT VALUE
  priority = false,
  fallback = "",
  onClick,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Tối ưu URL
  const optimizedSrc = optimizeImageUrl(src, width, height);

  // Nếu lỗi hoặc không có src, dùng fallback
  const finalSrc = hasError || !optimizedSrc ? fallback : optimizedSrc;

  // Nếu không có src và không có fallback
  if (!finalSrc) {
    return (
      <div
        className={`bg-zinc-800 flex items-center justify-center ${className}`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <span className="text-zinc-600 text-sm">No Image</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-zinc-800 ${className}`}
      style={{ aspectRatio: `${width}/${height}` }}
      onClick={onClick}
    >
      {/* Skeleton loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1. 5s infinite",
          }}
        />
      )}

      <img
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`
          w-full h-full object-cover
          transition-opacity duration-300
          ${isLoaded ? "opacity-100" : "opacity-0"}
          ${imgClassName}
        `}
      />
    </div>
  );
}
