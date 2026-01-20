import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";

interface Notification {
  id: string;
  type: "ORGANIZER_PENDING" | "EVENT_PENDING" | "UNLOCK_REQUEST";
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
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
};

// Fetch tất cả pending items để tạo notifications
export const fetchAdminNotifications = createAsyncThunk(
  "notifications/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const [organizers, events] = await Promise.all([
        apiService.get<any[]>("/organizers"),
        apiService.get<any[]>("/events/all"),
      ]);

      const notifications: Notification[] = [];

      // Organizer chờ duyệt
      const pendingOrganizers = organizers.filter(
        (o) => o.status === "PENDING" || o.status === "PENDING_APPROVAL",
      );
      pendingOrganizers.forEach((org) => {
        notifications.push({
          id: `org-${org.organizerId}`,
          type: "ORGANIZER_PENDING",
          title: "Yêu cầu đăng ký Organizer",
          message: `${org.organizerName} đang chờ duyệt`,
          data: org,
          createdAt: org.createdAt || new Date().toISOString(),
          read: false,
        });
      });

      // Organizer xin mở khóa
      const unlockRequests = organizers.filter((o) => o.unlockRequested);
      unlockRequests.forEach((org) => {
        notifications.push({
          id: `unlock-${org.organizerId}`,
          type: "UNLOCK_REQUEST",
          title: "Yêu cầu mở khóa tài khoản",
          message: `${org.organizerName} yêu cầu mở khóa`,
          data: org,
          createdAt: org.updatedAt || new Date().toISOString(),
          read: false,
        });
      });

      // Event chờ duyệt
      const pendingEvents = events.filter(
        (e) => e.status === "PENDING_APPROVAL",
      );
      pendingEvents.forEach((event) => {
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

      // Sắp xếp theo thời gian mới nhất
      notifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return notifications;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAsRead: (state, action) => {
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
    removeNotification: (state, action) => {
      const index = state.items.findIndex((n) => n.id === action.payload);
      if (index !== -1) {
        if (!state.items[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(index, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchAdminNotifications.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { markAsRead, markAllAsRead, removeNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
