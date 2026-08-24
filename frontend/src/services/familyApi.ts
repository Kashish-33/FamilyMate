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

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
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

export const createFamilyMember = async (member: {
  name: string;
  relation: string;
  age: number;
  gender: string;
  phone: string;
}) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/family-members/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not add family member."
      )
    );
  }

  return data;
};

export const createFamily = async (
  familyName: string
) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/families/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        family_name: familyName,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not create family."
      )
    );
  }

  return data;
};

export const updateFamilyMember = async (
  memberId: number,
  member: {
    name: string;
    relation: string;
    age: number;
    gender: string;
    phone: string;
  }
): Promise<FamilyMember> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/family-members/${memberId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Could not update family member."
      )
    );
  }

  return data;
};

export const deleteFamilyMember = async (
  memberId: number
): Promise<void> => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/family-members/${memberId}`,
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
        "Could not delete family member."
      )
    );
  }
};
