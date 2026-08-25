const API_BASE_URL = import.meta.env.VITE_API_URL;

type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
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

export const loginUser = async (
  email: string,
  password: string
) => {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(
    `${API_BASE_URL}/users/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formData,
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Invalid email or password"
      )
    );
  }

  return data;
};

export const signupUser = async (
  payload: SignupPayload
) => {
  const response = await fetch(
    `${API_BASE_URL}/users/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Could not sign up.")
    );
  }

  return data;
};
