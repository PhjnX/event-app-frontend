/**
 * Lớp nhiễu hạt phủ lên nền tối.
 *
 * Trước đây trỏ tới https://grainy-gradients.vercel.app/noise.svg — trang đó đã
 * gỡ file nên mọi lần tải đều 404 và bẩn console. Nhúng thẳng SVG dưới dạng
 * data URI: không phụ thuộc bên thứ ba, không thêm request, và hoạt động cả khi
 * mất mạng.
 */
export const NOISE_TEXTURE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";
