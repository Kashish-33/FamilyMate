import type { ChatResponse } from "../types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getToken = (): string => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please login again.");
  }

  return token;
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorMessage = (data: unknown, fallback: string): string => {
  if (!isRecord(data)) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) =>
        isRecord(item) && typeof item.msg === "string"
          ? item.msg
          : String(item)
      )
      .join(", ");
  }
  if (typeof data.message === "string") return data.message;
  return fallback;
};

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Could not get a response from FamilyMate."));
  }
  if (!isRecord(data) || typeof data.response !== "string") {
    throw new Error("Received an invalid response from FamilyMate.");
  }

  return { response: data.response };
};
