const API_BASE_URL = "http://127.0.0.1:8000";

export async function getFamilyMembers() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("User is not logged in");
  }

  const response = await fetch(
    `${API_BASE_URL}/family-members/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch family members: ${response.status}`
    );
  }

  return response.json();
}