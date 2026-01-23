import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import apiService from "../../services/apiService";

// --- Types ---
interface NotificationData {
  eventId?: string;
  organizerId?: string;
  registrationId?: string;
  rejectionReason?: string;
  reason?: string;
  unlockReason?: string;
  editRequestReason?: string; // Thêm trường này
  [key: string]: any;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
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

// --- HÀM HELPER ---
const getValidDate = (obj: any, priorityField: string): string => {
  if (!obj) return new Date().toISOString();
  if (obj[priorityField]) return obj[priorityField];
  const fallbackFields = [
    "updatedAt",
    "updatedDate",
    "lastModifiedDate",
    "createdAt",
    "createdDate",
    "registrationDate",
    "startDate",
  ];
  for (const field of fallbackFields) {
    if (obj[field]) return obj[field];
  }
  return new Date().toISOString();
};

// --- ADMIN NOTIFICATIONS ---
export const fetchAdminNotifications = createAsyncThunk(
  "notifications/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const [organizers, events] = await Promise.all([
        apiService.get<any[]>("/organizers"),
        apiService.get<any[]>("/events/all"),
      ]);

      const notifications: Notification[] = [];

      // 1. Organizer Pending
      if (Array.isArray(organizers)) {
        organizers
          .filter((o) => o.status === "PENDING" || o.approved === false)
          .forEach((org) => {
            notifications.push({
              id: `org-pending-${org.organizerId}`,
              type: "ORGANIZER_PENDING",
              title: "Yêu cầu đăng ký Organizer",
              message: `${org.organizerName || org.name || "Nhà tổ chức"} (${org.username}) đang chờ duyệt`,
              data: org,
              createdAt: getValidDate(org, "createdAt"),
              read: false,
            });
          });

        // 2. Unlock Request
        organizers
          .filter((o) => o.unlockRequested)
          .forEach((org) => {
            notifications.push({
              id: `org-unlock-${org.organizerId}`,
              type: "UNLOCK_REQUEST",
              title: "Yêu cầu mở khóa tài khoản",
              message: `${org.organizerName || org.name} yêu cầu mở khóa`,
              data: org,
              createdAt: getValidDate(org, "updatedAt"),
              read: false,
            });
          });
      }

      // 3. Event Notifications
      if (Array.isArray(events)) {
        events.forEach((event) => {
          // A. Event Pending Approval
          if (event.status === "PENDING_APPROVAL") {
            notifications.push({
              id: `event-pending-${event.eventId}`,
              type: "EVENT_PENDING",
              title: "Sự kiện chờ duyệt",
              message: `"${event.eventName}" đang chờ phê duyệt`,
              data: event,
              createdAt: getValidDate(event, "updatedAt"),
              read: false,
            });
          }

          // B. Edit Request (MỚI THÊM)
          // Giả sử API trả về field editRequested = true khi có yêu cầu sửa
          if (event.editRequested) {
            notifications.push({
              id: `edit-request-${event.eventId}`,
              type: "EDIT_REQUEST_PENDING",
              title: "Yêu cầu chỉnh sửa sự kiện",
              message: `Organizer muốn chỉnh sửa sự kiện "${event.eventName}"`,
              data: {
                ...event,
                reason: event.editRequestReason, // Lấy lý do từ API
              },
              createdAt: getValidDate(event, "updatedAt"), // Lấy ngày update gần nhất (lúc gửi request)
              read: false,
            });
          }
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

// --- ORGANIZER NOTIFICATIONS ---
export const fetchOrganizerNotifications = createAsyncThunk(
  "notifications/fetchOrganizer",
  async (_, { rejectWithValue }) => {
    try {
      const notifList: Notification[] = [];
      const myEvents = await apiService.get<any[]>("/events/my-events");

      if (Array.isArray(myEvents)) {
        // 1. Trạng thái sự kiện thay đổi (Approved/Rejected)
        myEvents.forEach((event) => {
          if (event.status === "APPROVED" || event.status === "REJECTED") {
            notifList.push({
              id: `event-status-${event.eventId}-${event.status}`,
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
              data: event,
              createdAt: getValidDate(event, "updatedAt"),
              read: false,
            });
          }

          // 2. Phản hồi Edit Request (MỚI THÊM)
          // Nếu sự kiện đang là PUBLISHED/APPROVED nhưng editRequested = false và có editRejectionReason
          // -> Có nghĩa là request đã bị từ chối hoặc đã được duyệt (nếu status chuyển về DRAFT)

          // Case A: Request Bị từ chối
          // Giả sử API có field: editRequestStatus = 'REJECTED'
          if (event.editRequestStatus === "REJECTED") {
            notifList.push({
              id: `edit-rejected-${event.eventId}`,
              type: "EDIT_REQUEST_REJECTED",
              title: "Yêu cầu chỉnh sửa bị từ chối",
              message: `Yêu cầu chỉnh sửa cho "${event.eventName}" đã bị từ chối`,
              data: { ...event, reason: event.editRejectionReason },
              createdAt: getValidDate(event, "updatedAt"),
              read: false,
            });
          }

          // Case B: Request Được duyệt -> Sự kiện chuyển về DRAFT/EDITABLE và editRequested = false
          // Logic này hơi khó bắt nếu không có log lịch sử.
          // Tạm thời ta có thể dựa vào việc status chuyển từ PUBLISHED -> DRAFT (nếu BE lưu log)
          // Hoặc đơn giản là khi Organizer thấy sự kiện quay về DRAFT thì họ tự biết.
        });

        // 3. Vé mới (Registrations)
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
                    ["PENDING", "PROCESSING", "WAITING", "SUCCESS"].includes(
                      r.status,
                    ),
                  )
                  .forEach((reg) => {
                    notifList.push({
                      id: `reg-${reg.registrationId || reg.id}`,
                      type: "NEW_REGISTRATION",
                      title: "Đăng ký mới",
                      message: `${reg.fullName || "Khách hàng"} đăng ký tham gia "${event.eventName}"`,
                      data: { ...reg, eventId: event.eventId },
                      createdAt: getValidDate(reg, "registrationDate"),
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
      const currentMap = new Map(state.items.map((i) => [i.id, i]));
      const newItems = action.payload.map((newItem) => {
        const existing = currentMap.get(newItem.id);
        return existing ? { ...newItem, read: existing.read } : newItem;
      });
      state.items = newItems.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      state.unreadCount = state.items.filter((n) => !n.read).length;
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
