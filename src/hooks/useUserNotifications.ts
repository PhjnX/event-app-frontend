import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchMyRegistrations,
  fetchPublicEvents,
} from "@/store/slices/eventSlice";
import { fetchPublicPosts } from "@/store/slices/newsSlice";
import type { AppDispatch, RootState } from "@/store";

export interface UserNotification {
  id: string;
  type:
    | "REGISTRATION_SUBMITTED"
    | "REGISTRATION_APPROVED"
    | "REGISTRATION_REJECTED"
    | "NEW_EVENT"
    | "NEW_POST";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  data?: any;
}

const STORAGE_KEY = "user_notifications_read_ids";

const isRecent = (dateString: string, days = 3) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};

export const useUserNotifications = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { myRegistrations } = useSelector((state: RootState) => state.events);

  const publicEvents = useSelector((state: RootState) => state.events.data);
  const publicPosts = useSelector((state: RootState) => state.news.data);

  const [readIds, setReadIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setReadIds(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing notification read IDs", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchMyRegistrations());
      dispatch(fetchPublicEvents());
      dispatch(fetchPublicPosts({ page: 0, size: 10 }));
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const notifications = useMemo(() => {
    if (!isInitialized) return [];
    const notifs: UserNotification[] = [];

    myRegistrations.forEach((reg: any) => {
      notifs.push({
        id: `reg-submit-${reg.registrationId}`,
        type: "REGISTRATION_SUBMITTED",
        title: t("notifications.reg_submitted_title"),
        message: t("notifications.reg_submitted_msg", {
          eventName: reg.eventName,
        }),
        time: reg.createdAt,
        read: readIds.includes(`reg-submit-${reg.registrationId}`),
        link: "/my-tickets",
        data: {
          ...reg,
          activityListStr: reg.activityNames,
        },
      });

      if (reg.status === "APPROVED" || reg.status === "CONFIRMED") {
        notifs.push({
          id: `reg-approved-${reg.registrationId}`,
          type: "REGISTRATION_APPROVED",
          title: t("notifications.reg_approved_title"),
          message: t("notifications.reg_approved_msg", {
            eventName: reg.eventName,
          }),
          time: reg.updatedAt,
          read: readIds.includes(`reg-approved-${reg.registrationId}`),
          link: "/my-tickets",
          data: {
            ...reg,
            activityListStr: reg.activityNames,
          },
        });
      } else if (reg.status === "REJECTED") {
        const baseMsg = t("notifications.reg_rejected_msg", {
          eventName: reg.eventName,
        });
        const reasonMsg = reg.rejectionReason
          ? ` ${t("notifications.reason_prefix", { reason: reg.rejectionReason })}`
          : "";

        notifs.push({
          id: `reg-rejected-${reg.registrationId}`,
          type: "REGISTRATION_REJECTED",
          title: t("notifications.reg_rejected_title"),
          message: `${baseMsg}${reasonMsg}`,
          time: reg.updatedAt,
          read: readIds.includes(`reg-rejected-${reg.registrationId}`),
          link: "/my-tickets",
          data: reg,
        });
      }
    });

    if (Array.isArray(publicEvents)) {
      publicEvents.forEach((evt: any) => {
        const eventDate = evt.createdAt || evt.startDate;
        if (isRecent(eventDate, 7)) {
          notifs.push({
            id: `new-event-${evt.eventId}`,
            type: "NEW_EVENT",
            title: t("notifications.new_event_title"),
            message: t("notifications.new_event_msg", {
              eventName: evt.eventName,
            }),
            time: eventDate,
            read: readIds.includes(`new-event-${evt.eventId}`),
            link: `/event/${evt.slug}`,
          });
        }
      });
    }

    if (Array.isArray(publicPosts)) {
      publicPosts.forEach((post: any) => {
        if (isRecent(post.createdAt, 5)) {
          notifs.push({
            id: `new-post-${post.id}`,
            type: "NEW_POST",
            title: t("notifications.new_post_title"),
            message: post.title,
            time: post.createdAt,
            read: readIds.includes(`new-post-${post.id}`),
            link: `/news/${post.slug}`,
          });
        }
      });
    }

    return notifs.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  }, [myRegistrations, publicEvents, publicPosts, readIds, isInitialized, t]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const newIds = [...readIds, id];
      setReadIds(newIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
