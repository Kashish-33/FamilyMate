import { useEffect, useState } from "react";

import type { NotificationItem } from "../types/notification";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationApi";

import NotificationCard from "../components/notifications/NotificationCard";

function Notifications() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    void loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();
      setNotifications(data);
      window.dispatchEvent(
        new Event("notifications-updated")
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const handleMarkAsRead = async (
    notificationId: number
  ) => {
    try {
      setActionLoading(true);
      setError("");
      setActionMessage("");

      await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
      window.dispatchEvent(
        new Event("notifications-updated")
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not mark notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      setError("");
      setActionMessage("");

      const response = await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
      window.dispatchEvent(
        new Event("notifications-updated")
      );

      if (response.updated_count > 0) {
        setActionMessage(
          `${response.updated_count} notification(s) marked as read.`
        );
        setTimeout(() => {
          setActionMessage("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (value: string): string =>
    new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9FA] p-10">
        <p className="text-sm font-semibold text-[#B86F83]">
          FAMILY ALERTS
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-800">
          Notifications
        </h1>

        <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#FCECEF] border-t-[#D98FA3]" />

          <p className="mt-4 text-slate-500">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA] p-6 md:p-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#B86F83]">
            FAMILY ALERTS
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Notifications
          </h1>

          <p className="mt-2 text-slate-500">
            Stay updated on medicine and document reminders.
          </p>
        </div>

        <button
          type="button"
          disabled={actionLoading || unreadCount === 0}
          onClick={() => void handleMarkAllAsRead()}
          className="rounded-2xl border border-[#E9D5DA] bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition hover:bg-[#FFF9FA] disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-[#F0E1E5] bg-white px-5 py-4">
        <p className="text-sm text-slate-500">
          Unread notifications:
          <span className="ml-2 font-semibold text-slate-800">
            {unreadCount}
          </span>
        </p>
      </div>

      {actionMessage && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-medium text-green-700">
          ✓ {actionMessage}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
          ⚠ {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FCECEF] text-4xl">
            🔔
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800">
            No notifications yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-slate-500">
            Alerts from medicine and document reminders will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={(id) =>
                void handleMarkAsRead(id)
              }
              actionLoading={actionLoading}
              formatDateTime={formatDateTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
