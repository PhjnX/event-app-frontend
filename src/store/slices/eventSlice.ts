import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import type { Event } from "../../models/event";
import { logoutUser } from "./auth";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://event-app-y77p.onrender.com/api";

const getBackendRootUrl = () => {
  if (API_URL.endsWith("/api")) {
    return API_URL.slice(0, -4);
  }
  return API_URL;
};

const processImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  const root = getBackendRootUrl();
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${root}${cleanPath}`;
};

// ... (Giữ nguyên các interface Activity, RegistrationDetail...)
interface Activity {
  activityId: number;
  activityName: string;
  startTime: string;
  endTime: string;
  roomOrVenue: string;
  activityStatus: string;
  activityCheckInStatus: string;
}

interface RegistrationDetail {
  id: number;
  ticketCode: string;
  status: string;
  registrationDate: string;
  eventCheckInStatus: string;
  userId: number;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  activities: Activity[];
}

interface EventState {
  data: Event[];
  featuredEvents: Event[];
  selectedEvents: Event[];
  registrations: any[];
  myRegistrations: any[];
  selectedRegistrationDetail: RegistrationDetail | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
}

const initialState: EventState = {
  data: [],
  featuredEvents: [],
  selectedEvents: [],
  registrations: [],
  myRegistrations: [],
  selectedRegistrationDetail: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,
};

// ... (Giữ nguyên các thunk cũ: fetchPublicEvents, fetchAllEvents, registerForEvent...)
export const fetchPublicEvents = createAsyncThunk(
  "events/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get<Event[]>("/events/public");
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchAllEvents = createAsyncThunk(
  "events/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get<Event[]>("/events/all");
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchMyEvents = createAsyncThunk(
  "events/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get<Event[]>("/events/my-events");
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchFeaturedEvents = createAsyncThunk(
  "events/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get<Event[]>("/events/featured");
      return Array.isArray(res) ? res : [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchSelectedEvents = createAsyncThunk(
  "events/fetchSelected",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get<Event[]>("/events/upcoming-selected");
      return Array.isArray(res) ? res : [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const updateFeaturedEvents = createAsyncThunk(
  "events/updateFeatured",
  async (ids: number[], { rejectWithValue }) => {
    try {
      await apiService.put("/events/featured", ids);
      return ids;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const updateSelectedEvents = createAsyncThunk(
  "events/updateSelected",
  async (ids: number[], { rejectWithValue }) => {
    try {
      await apiService.put("/events/upcoming-selected", ids);
      return ids;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const uploadEventImage = createAsyncThunk(
  "events/uploadImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiService.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Lỗi upload ảnh",
      );
    }
  },
);

export const registerForEvent = createAsyncThunk(
  "events/register",
  async (
    payload: { eventId: number; activityIds: number[] },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.post("/events/register", payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Đăng ký thất bại",
      );
    }
  },
);

export const addActivitiesToEvent = createAsyncThunk(
  "events/addActivities",
  async (
    payload: { eventId: number; activityIds: number[] },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.post(
        `/events/${payload.eventId}/add-activities`,
        payload.activityIds,
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Không thể thêm hoạt động",
      );
    }
  },
);

export const fetchMyRegistrations = createAsyncThunk(
  "events/fetchMyRegistrations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<any[]>("/events/my-registrations");
      if (!Array.isArray(response)) return [];
      const formattedData = await Promise.all(
        response.map(async (item: any) => {
          const evt = item.event || item;
          const eventId = evt.eventId || evt.id;
          const rawImage =
            evt.bannerImageUrl || evt.bannerUrl || evt.image || "";
          let activityNames = "";
          if (eventId) {
            try {
              const activitiesRes = await apiService.get<any[]>(
                `/activities/by-event/${eventId}/registered`,
              );
              if (Array.isArray(activitiesRes) && activitiesRes.length > 0) {
                activityNames = activitiesRes
                  .map((act) => act.activityName)
                  .join(", ");
              }
            } catch (error) {
              console.warn(
                `Không lấy được activities cho event ${eventId}`,
                error,
              );
            }
          }
          return {
            registrationId: item.registrationId || item.id,
            status: item.status,
            ticketCode: item.ticketCode,
            createdAt:
              item.registrationDate ||
              item.createdAt ||
              new Date().toISOString(),
            updatedAt:
              item.updatedAt ||
              item.registrationDate ||
              new Date().toISOString(),
            rejectionReason: item.rejectionReason,
            eventId: eventId,
            eventName: evt.eventName || "Sự kiện",
            eventSlug: evt.slug || evt.eventId?.toString() || "#",
            eventBanner: processImageUrl(rawImage),
            eventStartDate: evt.startDate,
            eventEndDate: evt.endDate,
            location: evt.location || "Online",
            activityNames: activityNames,
          };
        }),
      );
      return formattedData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchRegistrationDetail = createAsyncThunk(
  "events/fetchRegistrationDetail",
  async (registrationId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<RegistrationDetail>(
        `/events/registrations/${registrationId}/detail`,
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchEventRegistrations = createAsyncThunk(
  "events/fetchRegistrations",
  async (eventId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<any[]>(
        `/events/${eventId}/registrations`,
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const approveRegistration = createAsyncThunk(
  "events/approveRegistration",
  async (regId: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/events/registrations/${regId}/approve`);
      return regId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const rejectRegistration = createAsyncThunk(
  "events/rejectRegistration",
  async (
    { registrationId, reason }: { registrationId: number; reason: string },
    { rejectWithValue },
  ) => {
    try {
      await apiService.put(
        `/events/registrations/${registrationId}/reject`,
        null,
        { params: { reason } },
      );
      return { registrationId, reason };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const createEvent = createAsyncThunk(
  "events/create",
  async (data: Partial<Event>, { rejectWithValue }) => {
    try {
      return await apiService.post<Event>("/events", data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateEvent = createAsyncThunk(
  "events/update",
  async (
    { slug, data }: { slug: string; data: Partial<Event> },
    { rejectWithValue },
  ) => {
    try {
      return await apiService.put<Event>(`/events/${slug}`, data);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const submitEventForApproval = createAsyncThunk(
  "events/submit",
  async (slug: string, { rejectWithValue }) => {
    try {
      await apiService.put(`/events/${slug}/submit`);
      return slug;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const approveEvent = createAsyncThunk(
  "events/approve",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/events/${id}/approve`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const rejectEvent = createAsyncThunk(
  "events/reject",
  async (
    { eventId, reason }: { eventId: number; reason: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.put<Event>(
        `/events/${eventId}/reject`,
        null,
        {
          params: { reason },
        },
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (slug: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/events/${slug}`);
      return slug;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const subscribeNewsletter = createAsyncThunk(
  "events/subscribeNewsletter",
  async (email: string, { rejectWithValue }) => {
    try {
      await apiService.post("/events/newsletter/subscribe", email, {
        params: { subscribe: true },
        headers: { "Content-Type": "application/json" },
      });
      return email;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Đăng ký thất bại",
      );
    }
  },
);

// --- CÁC ACTION MỚI CHO EDIT REQUEST WORKFLOW ---

// 1. Organizer gửi yêu cầu chỉnh sửa
export const requestEditEvent = createAsyncThunk(
  "events/requestEdit",
  async (
    { eventId, reason }: { eventId: number; reason: string },
    { rejectWithValue },
  ) => {
    try {
      // POST /api/events/{eventId}/request-edit
      // Body: { reason: "string" }
      const response = await apiService.post(
        `/events/${eventId}/request-edit`,
        { reason },
      );
      return response; // Thường trả về message hoặc object event
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi gửi yêu cầu chỉnh sửa",
      );
    }
  },
);

// 2. SAdmin duyệt yêu cầu chỉnh sửa
export const approveEditRequest = createAsyncThunk(
  "events/approveEditRequest",
  async (eventId: number, { rejectWithValue }) => {
    try {
      // PUT /api/events/{eventId}/approve-edit-request
      const response = await apiService.put(
        `/events/${eventId}/approve-edit-request`,
        {},
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi duyệt yêu cầu",
      );
    }
  },
);

// 3. SAdmin từ chối yêu cầu chỉnh sửa
export const rejectEditRequest = createAsyncThunk(
  "events/rejectEditRequest",
  async (
    { eventId, reason }: { eventId: number; reason: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.put(
        `/events/${eventId}/reject-edit-request`,
        null,
        {
          params: { reason },
        },
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi từ chối yêu cầu",
      );
    }
  },
);

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearRegistrations: (state) => {
      state.registrations = [];
      state.myRegistrations = [];
      state.selectedRegistrationDetail = null;
    },
    clearRegistrationDetail: (state) => {
      state.selectedRegistrationDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ... Các case cũ
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.myRegistrations = action.payload;
      })
      .addCase(fetchPublicEvents.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchFeaturedEvents.fulfilled, (state, action) => {
        state.featuredEvents = action.payload;
      })
      .addCase(fetchSelectedEvents.fulfilled, (state, action) => {
        state.selectedEvents = action.payload;
      })
      .addCase(fetchRegistrationDetail.pending, (state) => {
        state.isDetailLoading = true;
        state.selectedRegistrationDetail = null;
      })
      .addCase(fetchRegistrationDetail.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.selectedRegistrationDetail = action.payload;
      })
      .addCase(fetchRegistrationDetail.rejected, (state) => {
        state.isDetailLoading = false;
        state.selectedRegistrationDetail = null;
      })
      .addCase(fetchEventRegistrations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrations = action.payload;
      })
      .addCase(fetchEventRegistrations.rejected, (state) => {
        state.isLoading = false;
        state.registrations = [];
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.data = state.data.filter((e) => e.slug !== action.payload);
      })
      .addCase(submitEventForApproval.fulfilled, (state, action) => {
        const index = state.data.findIndex((e) => e.slug === action.payload);
        if (index !== -1) {
          state.data[index].status = "PENDING_APPROVAL";
        }
      })
      .addCase(approveEvent.fulfilled, (state, action) => {
        const index = state.data.findIndex((e) => e.eventId === action.payload);
        if (index !== -1) {
          state.data[index].status = "PUBLISHED";
        }
      })
      .addCase(rejectEvent.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (e) => e.eventId === action.payload.eventId,
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      .addCase(requestEditEvent.fulfilled, (state, action) => {
        const { eventId, reason } = action.payload;
        const index = state.data.findIndex((e) => e.eventId === eventId);
        if (index !== -1) {
          state.data[index].editRequestStatus = "PENDING";
          state.data[index].editRequestReason = reason;
        }
      })

      .addCase(approveEditRequest.fulfilled, (state, action) => {
        const eventId = action.payload;
        const index = state.data.findIndex((e) => e.eventId === eventId);
        if (index !== -1) {
          state.data[index].editRequestStatus = "APPROVED";
          state.data[index].editLocked = false; // Mở khóa
        }
      })

      .addCase(rejectEditRequest.fulfilled, (state, action) => {
        const { eventId } = action.payload;
        const index = state.data.findIndex((e) => e.eventId === eventId);
        if (index !== -1) {
          state.data[index].editRequestStatus = "REJECTED";
        }
      })

      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearRegistrations, clearRegistrationDetail } =
  eventSlice.actions;
export default eventSlice.reducer;
