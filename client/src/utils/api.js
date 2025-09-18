// src/utils/api.js

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

// =============================
// Funkcje API dla profilu
// =============================

// Pobieranie profilu użytkownika
export async function fetchUserProfile(userId) {
  return apiFetch(`/user/profile/${userId}`);
}

// Aktualizacja własnego profilu
export async function updateUserProfile(userId, data) {
  return apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Upload zdjęcia do profilu
export async function uploadUserPhoto(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch(`/users/${userId}/photos`, {
    method: "POST",
    body: formData,
  });
}
