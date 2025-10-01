// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = API_URL; // alias dla zgodności

// -----------------------------
// Helpers
// -----------------------------

// Bezpieczny odczyt tokena
function getAccessToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    console.error("getAccessToken error:", e);
    return null;
  }
}

// Budowa nagłówków zależnie od body i ew. tokenu z parametru
function buildHeaders(options = {}, overrideToken) {
  const implicitToken = getAccessToken();
  const token = overrideToken || implicitToken;

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  const hasBody = Object.prototype.hasOwnProperty.call(options, "body");
  const isFormData = hasBody && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// Jednorazowe parsowanie odpowiedzi
async function parseResponseOnce(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (res.status === 204) {
    return { data: null };
  }

  try {
    if (isJson) {
      const json = await res.json();
      return { data: json };
    }
    const text = await res.text();
    return { data: text || null };
  } catch (e) {
    console.error("parseResponseOnce error:", e);
    return { data: null };
  }
}

// Normalizacja błędu
function makeFetchError(res, data) {
  const status = res.status;
  const base =
    (data && (data.message || data.error || data.title)) ||
    (typeof data === "string" ? data : "") ||
    `Request failed with status ${status}`;
  const err = new Error(base);
  err.status = status;
  err.data = data;
  return err;
}

// -----------------------------
// Public API
// -----------------------------

// Absolutny URL zdjęcia
export const getPhotoUrl = (relativeUrl) => {
  if (!relativeUrl) return null;
  const backendOrigin = import.meta.env.VITE_API_URL || "";
  return `${backendOrigin}${relativeUrl}`;
};

// Uniwersalny wrapper na fetch
export async function apiFetch(endpoint, options = {}, overrideToken) {
  try {
    const headers = buildHeaders(options, overrideToken);

    const init = { ...options, headers };
    if (Object.prototype.hasOwnProperty.call(options, "body")) {
      if (options.body == null) delete init.body;
    }

    const res = await fetch(`${API_URL}${endpoint}`, init);
    const { data } = await parseResponseOnce(res);

    if (!res.ok) {
      throw makeFetchError(res, data);
    }
    return data;
  } catch (e) {
    // globalny log + propagacja
    console.error(`apiFetch error for ${endpoint}:`, e);
    throw e;
  }
}

// =============================
// Profile API
// =============================

export async function fetchUserProfile(userId) {
  try {
    return await apiFetch(`/user/profile/${userId}`);
  } catch (e) {
    console.error("fetchUserProfile error:", e);
    throw e;
  }
}

export async function updateUserProfile(userId, profileData, token) {
  try {
    return await apiFetch(
      `/user/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      },
      token
    );
  } catch (e) {
    console.error("updateUserProfile error:", e);
    throw e;
  }
}

// -----------------------------
// Photos
// -----------------------------

export async function uploadUserPhoto(userId, file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    return await apiFetch(`/api/users/${userId}/photos`, {
      method: "POST",
      body: formData,
    });
  } catch (e) {
    console.error("uploadUserPhoto error:", e);
    throw e;
  }
}

export const fetchUserPhotos = async (userId, accessToken) => {
  try {
    return await apiFetch(
      `/api/users/${userId}/photos`,
      { method: "GET" },
      accessToken
    );
  } catch (e) {
    console.error("fetchUserPhotos error:", e);
    throw e;
  }
};

export const addUserPhoto = async (userId, photoFile, accessToken) => {
  try {
    const formData = new FormData();
    formData.append("File", photoFile);

    return await apiFetch(
      `/api/users/${userId}/photos`,
      { method: "POST", body: formData },
      accessToken
    );
  } catch (e) {
    console.error("addUserPhoto error:", e);
    throw e;
  }
};

export const deleteUserPhoto = async (userId, photoId, accessToken) => {
  try {
    await apiFetch(
      `/api/users/${userId}/photos/${photoId}`,
      { method: "DELETE" },
      accessToken
    );
    return true;
  } catch (e) {
    console.error("deleteUserPhoto error:", e);
    throw e;
  }
};

export const setMainUserPhoto = async (userId, photoId, accessToken) => {
  try {
    await apiFetch(
      `/api/users/${userId}/photos/${photoId}/main`,
      { method: "PUT" },
      accessToken
    );
    return true;
  } catch (e) {
    console.error("setMainUserPhoto error:", e);
    throw e;
  }
};

// -----------------------------
// Experience
// -----------------------------

export const addUserExperience = async (
  userId,
  experienceData,
  accessToken
) => {
  try {
    return await apiFetch(
      `/experience/${userId}/add`,
      {
        method: "POST",
        body: JSON.stringify(experienceData),
      },
      accessToken
    );
  } catch (e) {
    console.error("addUserExperience error:", e);
    throw e;
  }
};

export const updateUserExperience = async (
  userId,
  experienceId,
  experienceData,
  accessToken
) => {
  try {
    const dataToSend = { ...experienceData };
    if (dataToSend.stillWorking) {
      delete dataToSend.stillWorking;
      delete dataToSend.endDate;
    }

    await apiFetch(
      `/experience/${userId}/update/${experienceId}`,
      {
        method: "PUT",
        body: JSON.stringify(dataToSend),
      },
      accessToken
    );
    return true;
  } catch (e) {
    console.error("updateUserExperience error:", e);
    throw e;
  }
};

export const deleteUserExperience = async (
  userId,
  experienceId,
  accessToken
) => {
  try {
    await apiFetch(
      `/experience/${userId}/delete/${experienceId}`,
      { method: "DELETE" },
      accessToken
    );
  } catch (e) {
    console.error("deleteUserExperience error:", e);
    throw e;
  }
  return true;
};

// -----------------------------
// Favorites
// -----------------------------

export const fetchFavoriteUsers = async (accessToken) => {
  try {
    return await apiFetch(`/favourites`, { method: "GET" }, accessToken);
  } catch (e) {
    console.error("fetchFavoriteUsers error:", e);
    throw e;
  }
};

export const addFavorite = async (userId, accessToken) => {
  try {
    // Może zwrócić pustą odpowiedź → apiFetch zwróci null
    const res = await apiFetch(
      `/favourites/${userId}`,
      { method: "POST" },
      accessToken
    );
    return res ?? true;
  } catch (e) {
    console.error("addFavorite error:", e);
    throw e;
  }
};

export const removeFavorite = async (userId, accessToken) => {
  try {
    await apiFetch(`/favourites/${userId}`, { method: "DELETE" }, accessToken);
    return true;
  } catch (e) {
    console.error("removeFavorite error:", e);
    throw e;
  }
};

export const checkIsFavorite = async (userId, accessToken) => {
  try {
    await apiFetch(`/favourites/${userId}`, { method: "GET" }, accessToken);
    return true;
  } catch (e) {
    if (e?.status === 404) return false; // brak ulubionego
    console.error("checkIsFavorite error:", e);
    return false;
  }
};

// -----------------------------
// Roles & filtering
// -----------------------------

export const fetchUserRoles = async (accessToken) => {
  try {
    return await apiFetch(`/user/roles`, { method: "GET" }, accessToken);
  } catch (e) {
    console.error("fetchUserRoles error:", e);
    throw e;
  }
};

// Filter users
export const filterUsers = async (filters, accessToken) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.minAge) queryParams.append("MinAge", filters.minAge);
    if (filters.maxAge) queryParams.append("MaxAge", filters.maxAge);
    if (filters.minHeight) queryParams.append("MinHeight", filters.minHeight);
    if (filters.maxHeight) queryParams.append("MaxHeight", filters.maxHeight);
    if (filters.minWeight) queryParams.append("MinWeight", filters.minWeight);
    if (filters.maxWeight) queryParams.append("MaxWeight", filters.maxWeight);

    if (filters.hairColors?.length) {
      filters.hairColors.forEach((c) => queryParams.append("HairColor", c));
    }
    if (filters.clothingSizes?.length) {
      filters.clothingSizes.forEach((s) =>
        queryParams.append("ClothingSize", s)
      );
    }
    if (filters.cities?.length) {
      filters.cities.forEach((city) => queryParams.append("City", city));
    }

    // Pagination
    queryParams.append("pageNumber", filters.pageNumber || 1);
    queryParams.append("pageSize", filters.pageSize || 12);

    const data = await apiFetch(
      `/FilterUsers?${queryParams.toString()}`,
      { method: "GET" },
      accessToken
    );

    return {
      users: Array.isArray(data) ? data : data?.users || data?.items || [],
      totalCount:
        data?.totalCount ||
        data?.total ||
        (Array.isArray(data) ? data.length : 0),
      currentPage: data?.currentPage || data?.page || filters.pageNumber || 1,
      totalPages:
        data?.totalPages ||
        Math.ceil(
          (data?.totalCount ||
            data?.total ||
            (Array.isArray(data) ? data.length : 0)) / (filters.pageSize || 12)
        ),
    };
  } catch (e) {
    console.error("filterUsers error:", e);
    throw e;
  }
};

// uczestnicy danego castingu (mapa userId -> string/rola)
export async function fetchCastingParticipants(castingId) {
  return apiFetch(`/casting/casting/participants/${castingId}`, {
    method: "GET",
  });
}

// usuń uczestnika z castingu
export async function deleteCastingParticipant(castingId, userId) {
  return apiFetch(`/casting/casting/${castingId}/participant/${userId}`, {
    method: "DELETE",
  });
}
