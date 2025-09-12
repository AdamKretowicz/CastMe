const API_URL = import.meta.env.VITE_API_URL;

// Funkcja do pobierania tokena z localStorage
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// Helper do requestów
export async function apiFetch(endpoint, options = {}) {
  const token = getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errMessage = await res.text();
    throw new Error(errMessage || "Request failed");
  }

  return res.json();
}
