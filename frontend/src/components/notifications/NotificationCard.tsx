import type { NotificationItem } from "../../types/notification";

type NotificationCardProps = {
  notification: NotificationItem;
  onMarkAsRead: (notificationId: number) => void;
  actionLoading: boolean;
  formatDateTime: (value: string) => string;
};

function NotificationCard({
  notification,
  onMarkAsRead,
  actionLoading,
  formatDateTime,
}: NotificationCardProps) {
  return (
    <div
      className={`rounded-3xl border bg-white p-6 shadow-sm transition ${
        notification.is_read
          ? "border-[#F0E1E5]"
          : "border-[#E8B8C6]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-[#B86F83]">
            {notification.notification_type.replaceAll(
              "_",
              " "
            )}
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-800">
            {notification.title}
          </h3>

          <p className="mt-2 text-slate-600">
            {notification.message}
          </p>
        </div>

        {!notification.is_read && (
          <span className="mt-1 inline-flex h-3 w-3 shrink-0 rounded-full bg-[#D98FA3]" />
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#F6E8EC] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          {formatDateTime(notification.created_at)}
        </p>

        {notification.is_read ? (
          <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            Read
          </span>
        ) : (
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onMarkAsRead(notification.id)}
            className="rounded-xl border border-[#E9D5DA] px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#FFF9FA] disabled:opacity-50"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationCard;
