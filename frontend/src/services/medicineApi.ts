import type {
  MedicineDetail,
  MedicineItem,
  MedicineReminderItem,
  MedicineUploadResponse,
} from "../types/medicine";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

export const getMedicines = async (
  memberId: number
): Promise<MedicineItem[]> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/medicines/member/${memberId}`,
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
        "Could not load medicines."
      )
    );
  }

  return Array.isArray(data) ? data : [];
};

export const getMedicine = async (
  medicineId: number
): Promise<MedicineDetail> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/medicines/${medicineId}`,
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
        "Could not load medicine details."
      )
    );
  }

  return data;
};

export const uploadMedicine = async (
  formData: FormData,
  signal?: AbortSignal
): Promise<MedicineUploadResponse> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/medicines/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal,
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not upload medicine."
      )
    );
  }

  return data;
};

export const updateMedicine = async (
  medicineId: number,
  formData: FormData
): Promise<MedicineDetail> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/medicines/${medicineId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not update medicine."
      )
    );
  }

  return data;
};

export const deleteMedicine = async (
  medicineId: number
): Promise<void> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/medicines/${medicineId}`,
    {
      method: "DELETE",
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
        "Could not delete medicine."
      )
    );
  }
};

export const getMedicineReminders = async (): Promise<
  MedicineReminderItem[]
> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/medicines/reminders`,
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
        "Could not load medicine reminders."
      )
    );
  }

  return Array.isArray(data) ? data : [];
};
