const optimizeCloudinaryUrl = (
  url: string,
  width: number,
  height?: number,
  options?: {
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif";
    crop?: "fill" | "scale" | "fit" | "thumb";
  },
): string => {
  const { quality = "auto", format = "auto", crop = "fill" } = options || {};

  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : "",
    `c_${crop}`,
    `f_${format}`,
    `q_${quality}`,
  ]
    .filter(Boolean)
    .join(",");

  return url.replace("/upload/", `/upload/${transforms}/`);
};

const optimizeUnsplashUrl = (
  url: string,
  width: number,
  height?: number,
): string => {
  const baseUrl = url.split("?")[0];
  const params = new URLSearchParams({
    w: width.toString(),
    fit: "crop",
    auto: "format",
    q: "75", 
  });

  if (height) {
    params.set("h", height.toString());
  }

  return `${baseUrl}?${params.toString()}`;
};

export const optimizeImageUrl = (
  url: string | undefined | null,
  width: number,
  height?: number,
): string => {
  if (!url || typeof url !== "string") return "";

  if (url.includes("cloudinary.com")) {
    return optimizeCloudinaryUrl(url, width, height);
  }

  if (url.includes("unsplash.com")) {
    return optimizeUnsplashUrl(url, width, height);
  }

  return url;
};
