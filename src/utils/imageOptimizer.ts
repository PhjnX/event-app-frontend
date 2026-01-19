/**
 * Utility functions để tối ưu hình ảnh từ các nguồn khác nhau
 */

// Tối ưu URL Cloudinary
export const optimizeCloudinaryUrl = (
  url: string | undefined | null,
  width: number,
  height?: number,
  options?: {
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif";
    crop?: "fill" | "scale" | "fit" | "thumb";
  },
): string => {
  // Kiểm tra URL hợp lệ
  if (!url || typeof url !== "string") return "";
  if (!url.includes("cloudinary.com")) return url;

  const { quality = "auto", format = "auto", crop = "fill" } = options || {};

  // Tạo chuỗi transformations
  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : "",
    `c_${crop}`,
    `f_${format}`,
    `q_${quality}`,
  ]
    .filter(Boolean)
    .join(",");

  // Chèn transformations vào URL
  return url.replace("/upload/", `/upload/${transforms}/`);
};

// Tối ưu URL Unsplash
export const optimizeUnsplashUrl = (
  url: string | undefined | null,
  width: number,
  height?: number,
): string => {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("unsplash.com")) return url;

  // Tách base URL và params
  const baseUrl = url.split("?")[0];

  // Tạo params mới
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

// Hàm tổng hợp - tự động detect và tối ưu
export const optimizeImageUrl = (
  url: string | undefined | null,
  width: number,
  height?: number,
): string => {
  if (!url) return "";

  if (url.includes("cloudinary.com")) {
    return optimizeCloudinaryUrl(url, width, height);
  }

  if (url.includes("unsplash.com")) {
    return optimizeUnsplashUrl(url, width, height);
  }

  // Trả về URL gốc nếu không phải Cloudinary/Unsplash
  return url;
};
