import axios from "@/services/apiService";

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
    return axios.post(`/events/${eventId}/moments`, data);
  },

  updateMoment: (
    eventId: number | string,
    momentId: number | string,
    data: { caption: string; imageUrl: string }
  ) => {
    return axios.put(`/events/${eventId}/moments/${momentId}`, data);
  },

  deleteMoment: (eventId: number | string, momentId: number | string) => {
    return axios.delete(`/events/${eventId}/moments/${momentId}`);
  },
};
