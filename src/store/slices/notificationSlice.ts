import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { parseServerDate } from "../../utils/datetime";

interface NotificationData {
  eventId?: string;
  organizerId?: string;
  registrationId?: string;
  rejectionReason?: string;
  reason?: string;
  unlockReason?: string;
  unlockRequestReason?: string;
  editRequestReason?: string;
  slug?: string;
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

// Backend dùng lẫn lộn "APPROVED" và "PUBLISHED" cho sự kiện đã duyệt; phần còn
// lại của dự án chấp nhận cả hai nên ở đây cũng phải vậy, không thì organizer
// mất hẳn thông báo "Sự kiện đã được duyệt".
const APPROVED_EVENT_STATUSES = ["APPROVED", "PUBLISHED"];

// Thông báo được dựng lại từ API mỗi lần poll nên không mang theo trạng thái đã
// đọc. Lưu id đã đọc xuống localStorage, giống cách useUserNotifications làm cho
// phía người dùng — nếu không, badge đỏ hiện lại sau mỗi lần F5.
// Thông báo cũ hơn mốc này không hiện nữa. Không có mốc thì danh sách tích tụ
// vô hạn và mỗi lần poll đều phải dựng lại toàn bộ.
const NOTIFICATION_TTL_DAYS = 30;

const isWithinTtl = (iso: string): boolean => {
  const time = new Date(iso).getTime();
  // Không đọc được ngày thì giữ lại — thà thừa một dòng còn hơn giấu mất việc cần xử lý
  if (Number.isNaN(time)) return true;
  return Date.now() - time <= NOTIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000;
};

const READ_STORAGE_KEY = "admin_notifications_read_ids";
const MAX_STORED_READ_IDS = 500;

const loadReadIds = (): string[] => {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveReadIds = (ids: string[]) => {
  try {
    // Giữ các id mới nhất để localStorage không phình vô hạn
    localStorage.setItem(
      READ_STORAGE_KEY,
      JSON.stringify(ids.slice(-MAX_STORED_READ_IDS)),
    );
  } catch {
    /* private mode hoặc hết quota — bỏ qua */
  }
};

const rememberRead = (newIds: string[]) => {
  const merged = loadReadIds();
  for (const id of newIds) if (!merged.includes(id)) merged.push(id);
  saveReadIds(merged);
};

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
              id: `org-pending-${org.organizerId}`,
              type: "ORGANIZER_PENDING",
              title: "Yêu cầu đăng ký Organizer",
              message: `${org.organizerName || org.name || "Nhà tổ chức"} (${org.username}) đang chờ duyệt`,
              data: org,
              createdAt: getValidDate(org, "createdAt"),
              read: false,
            });
          });

        organizers
          .filter((o) => o.unlockRequested)
          .forEach((org) => {
            notifications.push({
              id: `org-unlock-${org.organizerId}`,
              type: "UNLOCK_REQUEST",
              title: "Yêu cầu mở khóa tài khoản",
              message: `${org.organizerName || org.name} yêu cầu mở khóa`,
              data: {
                ...org,
                unlockReason: org.unlockRequestReason,
              },
              createdAt: getValidDate(org, "updatedAt"),
              read: false,
            });
          });
      }

      if (Array.isArray(events)) {
        events.forEach((event) => {
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

          if (
            event.editRequested === true ||
            event.editRequestStatus === "PENDING"
          ) {
            notifications.push({
              id: `edit-request-${event.eventId}`,
              type: "EDIT_REQUEST_PENDING",
              title: "Yêu cầu chỉnh sửa sự kiện",
              message: `Organizer muốn chỉnh sửa sự kiện "${event.eventName}"`,
              data: {
                ...event,
                reason: event.editRequestReason || "Không có lý do chi tiết",
              },
              createdAt: getValidDate(event, "updatedAt"),
              read: false,
            });
          }
        });
      }

      return notifications.sort(
        (a, b) =>
          parseServerDate(b.createdAt).getTime() -
          parseServerDate(a.createdAt).getTime(),
      );
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Đã có lỗi xảy ra",
      );
    }
  },
);

export const fetchOrganizerNotifications = createAsyncThunk(
  "notifications/fetchOrganizer",
  async (_, { rejectWithValue }) => {
    try {
      const notifList: Notification[] = [];
      const myEvents = await apiService.get<any[]>("/events/my-events");

      if (Array.isArray(myEvents)) {
        myEvents.forEach((event) => {
          if (
            APPROVED_EVENT_STATUSES.includes(event.status) &&
            !event.editRequestStatus
          ) {
            notifList.push({
              id: `event-status-${event.eventId}-APPROVED`,
              type: "EVENT_APPROVED",
              title: "Sự kiện đã được duyệt",
              message: `"${event.eventName}" đã được phê duyệt công khai.`,
              data: event,
              createdAt: getValidDate(event, "updatedAt"),
              read: false,
            });
          } else if (event.status === "REJECTED") {
            notifList.push({
              id: `event-status-${event.eventId}-REJECTED`,
              type: "EVENT_REJECTED",
              title: "Sự kiện bị từ chối",
              message: `"${event.eventName}" đã bị từ chối.`,
              data: event,
              createdAt: getValidDate(event, "updatedAt"),
              read: false,
            });
          }

          if (event.editRequestStatus === "REJECTED") {
            notifList.push({
              id: `edit-rejected-${event.eventId}`,
              type: "EDIT_REQUEST_REJECTED",
              title: "Yêu cầu chỉnh sửa bị từ chối",
              message: `Yêu cầu chỉnh sửa cho "${event.eventName}" không được chấp nhận.`,
              data: {
                ...event,
                rejectionReason:
                  event.editRejectionReason || event.rejectionReason,
              },
              createdAt: getValidDate(event, "updatedAt"),
              read: false,
            });
          }

          if (event.editRequestStatus === "APPROVED") {
            notifList.push({
              id: `edit-approved-${event.eventId}`,
              type: "EDIT_REQUEST_APPROVED",
              title: "Yêu cầu chỉnh sửa được chấp nhận",
              message: `Bạn đã có thể chỉnh sửa sự kiện "${event.eventName}".`,
              data: event,
              createdAt: getValidDate(event, "updatedAt"),
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
                  // Chỉ những đăng ký organizer thực sự cần bấm duyệt.
                  // "SUCCESS" đã hoàn tất nên không còn là việc cần xử lý —
                  // để nó ở đây thì sự kiện đông khách sẽ làm ngập chuông.
                  .filter((r) =>
                    ["PENDING", "PROCESSING", "WAITING"].includes(r.status),
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
            } catch (e) {
              // Một sự kiện lỗi không được làm hỏng cả chuông thông báo, nhưng
              // cũng không được im lặng — nếu không sẽ mất thông báo mà chẳng ai biết.
              console.warn(
                `Không tải được đăng ký của sự kiện ${event.eventId}:`,
                e,
              );
            }
          }),
        );
      }

      return notifList.sort(
        (a, b) =>
          parseServerDate(b.createdAt).getTime() -
          parseServerDate(a.createdAt).getTime(),
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
        rememberRead([action.payload]);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
      rememberRead(state.items.map((n) => n.id));
    },
  },
  extraReducers: (builder) => {
    const handleFulfilled = (
      state: NotificationState,
      action: PayloadAction<Notification[]>,
    ) => {
      state.isLoading = false;
      const currentMap = new Map(state.items.map((i) => [i.id, i]));
      const storedReadIds = loadReadIds();
      const newItems = action.payload.map((newItem) => {
        const existing = currentMap.get(newItem.id);
        if (existing) {
          // Giữ nguyên createdAt cũ: getValidDate rơi về thời điểm hiện tại khi
          // không tìm được ngày nào, nên nếu nhận mốc mới sau mỗi lần poll thì
          // danh sách sẽ tự xáo trộn thứ tự trước mắt người dùng.
          return {
            ...newItem,
            read: existing.read,
            createdAt: existing.createdAt,
          };
        }
        return { ...newItem, read: storedReadIds.includes(newItem.id) };
      });
      state.items = newItems
        .filter((n) => isWithinTtl(n.createdAt))
        .sort(
          (a, b) =>
            parseServerDate(b.createdAt).getTime() -
          parseServerDate(a.createdAt).getTime(),
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
