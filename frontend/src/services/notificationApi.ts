import type {
  NotificationItem,
  NotificationUnreadCountResponse,
} from "../types/notification";

const API_BASE_URL = "http://127.0.0.1:8000";

const getToken = (): string => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please login again.");
  }

  return token;
};

const parseResponse = async (response: Response) => {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
};

const getErrorMessage = (
  data: any,
  fallback: string
): string => {
  if (!data) {
    return fallback;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: any) => item?.msg || String(item))
      .join(", ");
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return fallback;
};

export const getNotifications = async (): Promise<
  NotificationItem[]
> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/notifications/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not load notifications."
      )
    );
  }

  return Array.isArray(data) ? data : [];
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/notifications/unread-count`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = (await parseResponse(
    response
  )) as NotificationUnreadCountResponse | null;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not load unread notification count."
      )
    );
  }

  return typeof data?.unread_count === "number"
    ? data.unread_count
    : 0;
};

export const markNotificationAsRead = async (
  notificationId: number
): Promise<NotificationItem> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not mark notification as read."
      )
    );
  }

  return data;
};

export const markAllNotificationsAsRead = async (): Promise<{
  message: string;
  updated_count: number;
}> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not mark all notifications as read."
      )
    );
  }

  return data;
};
