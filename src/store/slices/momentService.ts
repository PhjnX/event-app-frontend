import axios from "@/services/apiService";

/**
 * Ép caption và imageUrl về đúng chuỗi trước khi gửi lên.
 *
 * MomentRequestDTO khai cả hai là String. Nếu lỡ truyền vào một object —
 * hay gặp nhất là gán nguyên response của POST /images/upload thay vì bóc lấy
 * URL — backend trả 500 kèm "Cannot deserialize value of type java.lang.String
 * from Object value", một thông điệp chẳng chỉ ra trường nào sai.
 * Chặn ngay tại đây và nói rõ, thay vì để server đoán hộ.
 */
const sanitizeMomentPayload = (data: {
  caption: string;
  imageUrl: string;
}): { caption: string; imageUrl: string } => {
  const bad = (Object.keys(data) as (keyof typeof data)[]).filter(
    (k) => data[k] != null && typeof data[k] !== "string",
  );
  if (bad.length) {
    console.error("Payload moment sai kiểu:", { data, truongSai: bad });
    throw new Error(
      `Dữ liệu gửi lên sai kiểu ở trường: ${bad.join(", ")}. Vui lòng thử lại.`,
    );
  }
  return {
    caption: data.caption ?? "",
    imageUrl: data.imageUrl ?? "",
  };
};

export const momentApi = {
  getMoments: (eventId: number | string, page = 0, size = 10) => {
    return axios.get(`/events/${eventId}/moments`, {
      params: {
        page,
        size,
        sort: "postedAt,desc",
      },
    });
  },

  getMyMoments: (eventId: number | string) => {
    return axios.get(`/events/${eventId}/moments/me`);
  },

  createMoment: (
    eventId: number | string,
    data: { caption: string; imageUrl: string }
  ) => {
    return axios.post(`/events/${eventId}/moments`, sanitizeMomentPayload(data));
  },

  updateMoment: (
    eventId: number | string,
    momentId: number | string,
    data: { caption: string; imageUrl: string }
  ) => {
    return axios.put(
      `/events/${eventId}/moments/${momentId}`,
      sanitizeMomentPayload(data),
    );
  },

  deleteMoment: (eventId: number | string, momentId: number | string) => {
    return axios.delete(`/events/${eventId}/moments/${momentId}`);
  },
};
