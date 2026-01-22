import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import apiService from "../../services/apiService";

interface Notification {
  id: string;
  type:
    | "ORGANIZER_PENDING"
    | "EVENT_PENDING"
    | "UNLOCK_REQUEST"
    | "NEW_REGISTRATION"
    | "EVENT_APPROVED"
    | "EVENT_REJECTED"
    | "ACCOUNT_LOCKED"
    | "ACCOUNT_UNLOCKED";
  title: string;
  message: string;
  data: any;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// --- FETCHER CHO ADMIN ---
export const fetchAdminNotifications = createAsyncThunk(
  "notifications/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const [organizers, events] = await Promise.all([
        apiService.get<any[]>("/organizers"),
        apiService.get<any[]>("/events/all"),
      ]);

      const notifications: Notification[] = [];

      if (Array.isArray(organizers)) {
        organizers
          .filter((o) => o.status === "PENDING" || o.approved === false)
          .forEach((org) => {
            notifications.push({
              id: `org-${org.organizerId}`,
              type: "ORGANIZER_PENDING",
              title: "Yêu cầu đăng ký Organizer",
              message: `${
                org.organizerName || org.name || "Nhà tổ chức"
              } đang chờ duyệt`,
              data: org,
              createdAt: org.createdAt || new Date().toISOString(),
              read: false,
            });
          });

        organizers
          .filter((o) => o.unlockRequested)
          .forEach((org) => {
            notifications.push({
              id: `unlock-${org.organizerId}`,
              type: "UNLOCK_REQUEST",
              title: "Yêu cầu mở khóa tài khoản",
              message: `${
                org.organizerName || org.name || "Nhà tổ chức"
              } yêu cầu mở khóa`,
              data: org,
              createdAt: org.updatedAt || new Date().toISOString(),
              read: false,
            });
          });
      }

      if (Array.isArray(events)) {
        events
          .filter((e) => e.status === "PENDING_APPROVAL")
          .forEach((event) => {
            notifications.push({
              id: `event-${event.eventId}`,
              type: "EVENT_PENDING",
              title: "Sự kiện chờ duyệt",
              message: `"${event.eventName}" đang chờ phê duyệt`,
              data: event,
              createdAt: event.createdAt || new Date().toISOString(),
              read: false,
            });
          });
      }

      return notifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Đã có lỗi xảy ra",
      );
    }
  },
);

// --- FETCHER CHO ORGANIZER ---
export const fetchOrganizerNotifications = createAsyncThunk(
  "notifications/fetchOrganizer",
  async (_, { rejectWithValue }) => {
    try {
      const notifList: Notification[] = [];
      const myEvents = await apiService.get<any[]>("/events/my-events");

      if (Array.isArray(myEvents)) {
        myEvents.forEach((event) => {
          if (event.status === "APPROVED" || event.status === "REJECTED") {
            notifList.push({
              id: `${event.status.toLowerCase()}-${event.eventId}`,
              type:
                event.status === "APPROVED"
                  ? "EVENT_APPROVED"
                  : "EVENT_REJECTED",
              title:
                event.status === "APPROVED"
                  ? "Sự kiện đã được duyệt"
                  : "Sự kiện bị từ chối",
              message: `"${event.eventName}" ${
                event.status === "APPROVED"
                  ? "đã được phê duyệt"
                  : "đã bị từ chối"
              }`,
              // Lưu data là object event -> UI sẽ tự tìm field reason
              data: event,
              createdAt:
                event.updatedAt || event.createdAt || new Date().toISOString(),
              read: false,
            });
          }
        });

        const activeEvents = myEvents.filter((e) =>
          ["APPROVED", "ONGOING", "PUBLISHED"].includes(e.status),
        );

        await Promise.all(
          activeEvents.map(async (event) => {
            try {
              const regs = await apiService.get<any[]>(
                `/events/${event.eventId}/registrations`,
              );
              if (Array.isArray(regs)) {
                regs
                  .filter((r) =>
                    ["PENDING", "PROCESSING", "WAITING"].includes(r.status),
                  )
                  .forEach((reg) => {
                    notifList.push({
                      id: `reg-${reg.registrationId || reg.id}`,
                      type: "NEW_REGISTRATION",
                      title: "Đăng ký mới",
                      message: `${
                        reg.fullName || "Khách hàng"
                      } đăng ký tham gia "${event.eventName}"`,
                      data: { ...reg, eventId: event.eventId },
                      createdAt:
                        reg.registrationDate || new Date().toISOString(),
                      read: false,
                    });
                  });
              }
            } catch (e) {}
          }),
        );
      }

      return notifList.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Đã có lỗi xảy ra",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    const handleFulfilled = (
      state: NotificationState,
      action: PayloadAction<Notification[]>,
    ) => {
      state.isLoading = false;
      const newItems = action.payload.map((newItem) => {
        const oldItem = state.items.find((old) => old.id === newItem.id);
        return oldItem ? { ...newItem, read: oldItem.read } : newItem;
      });
      state.items = newItems;
      state.unreadCount = newItems.filter((n) => !n.read).length;
    };

    builder
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminNotifications.fulfilled, handleFulfilled)
      .addCase(fetchAdminNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrganizerNotifications.fulfilled, handleFulfilled);
  },
});

export const { markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
