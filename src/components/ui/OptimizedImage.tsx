import { useState } from "react";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fallback?: string;
  onClick?: () => void;
  enableHover?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none"; 
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  imgClassName = "",
  priority = false,
  fallback = "",
  onClick,
  enableHover = false,
  aspectRatio, 
  objectFit = "cover", // ✅ DEFAULT là cover
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = optimizeImageUrl(src, width, height);
  const finalSrc = hasError || !optimizedSrc ? fallback : optimizedSrc;

  if (!finalSrc) {
    return (
      <div
        className={`bg-zinc-800 flex items-center justify-center ${className}`}
        style={{ aspectRatio: aspectRatio || `${width}/${height}` }}
      >
        <span className="text-zinc-600 text-sm">No Image</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-zinc-800 ${className}`}
      style={{ aspectRatio: aspectRatio || `${width}/${height}` }} 
      onClick={onClick}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
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
        fetchPriority={priority ? "high" : "low"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`
          w-full h-full
          transition-opacity duration-300
          ${isLoaded ? "opacity-100" : "opacity-0"}
          ${enableHover ? "group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" : ""}
          ${imgClassName}
        `}
        style={{ objectFit }} 
      />
    </div>
  );
}
