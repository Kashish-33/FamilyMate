import type { DocumentItem } from "../types/document";
import type { FamilyMember } from "../types/family";

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

/* ---------------- GET FAMILY MEMBERS ---------------- */

export const getFamilyMembers =
  async (): Promise<FamilyMember[]> => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/family-members/`,
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
          "Could not load family members."
        )
      );
    }

    return Array.isArray(data) ? data : [];
  };

/* ---------------- GET DOCUMENTS ---------------- */

export const getDocuments = async (
  memberId?: number
): Promise<DocumentItem[]> => {
  const token = getToken();

  const url = memberId
    ? `${API_BASE_URL}/documents/member/${memberId}`
    : `${API_BASE_URL}/documents/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not load documents."
      )
    );
  }

  return Array.isArray(data) ? data : [];
};

/* ---------------- UPLOAD DOCUMENT ---------------- */
export const uploadDocument = async (
  formData: FormData,
  signal?: AbortSignal
) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/documents/`,
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
        "Could not upload document."
      )
    );
  }

  return data;
};

/* ---------------- UPDATE DOCUMENT ---------------- */
export const updateDocument = async (
  documentId: number,
  formData: FormData
) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}`,
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
        "Could not update document."
      )
    );
  }

  return data;
};

/* ---------------- DELETE DOCUMENT ---------------- */

export const deleteDocument = async (
  documentId: number
): Promise<void> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}`,
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
        "Could not delete document."
      )
    );
  }
};