// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = API_URL; // Adjust if different

//Retrive photo url

export const getPhotoUrl = (url) => {
  if (!url) return null;

  // If it's already a full URL (starts with http or https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Otherwise, treat it as a relative URL and prepend backend origin
  const backendOrigin = import.meta.env.VITE_API_URL || '';
  
  // Ensure there's no double slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  return `${backendOrigin}${cleanUrl}`;
};

// Get token from localStorage
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// Universal fetch wrapper
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
    let message = `Request failed with status ${res.status}`;
    try {
      // Attempt to parse error response if JSON
      const errData = await res.json();
      message = errData.message || JSON.stringify(errData);
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  // Safe JSON parsing: allow empty responses
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// =============================
// Profile API
// =============================

// Fetch user profile
export async function fetchUserProfile(userId) {
  return apiFetch(`/user/profile/${userId}`);
}

// Update user profile
export async function updateUserProfile(userId, profileData, token) {
  return apiFetch(`/user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(profileData),
  });
}



//Edit photos
// Upload profile photo
export async function uploadUserPhoto(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch(`/api/users/${userId}/photos`, {
    method: "POST",
    body: formData,
  });
}

// Photo Management Functions
export const fetchUserPhotos = async (userId, accessToken) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/photos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user photos:', error);
    throw error;
  }
};

export const addUserPhoto = async (userId, photoFile, accessToken) => {
  try {
    const formData = new FormData();
    formData.append('File', photoFile);

    const response = await fetch(`${API_URL}/api/users/${userId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding user photo:', error);
    throw error;
  }
};
export const deleteUserPhoto = async (userId, photoId, accessToken) => {
  try {
    const response = await fetch(`${ API_URL}/api/users/${userId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting user photo:', error);
    throw error;
  }
};

export const setMainUserPhoto = async (userId, photoId, accessToken) => {
  try {
    const response = await fetch(`${ API_URL}/api/users/${userId}/photos/${photoId}/main`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error setting main user photo:', error);
    throw error;
  }
};

// Experience Management Functions
export const addUserExperience = async (userId, experienceData, accessToken) => {
  try {
    const response = await fetch(`${ API_URL}/experience/${userId}/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(experienceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding experience:', error);
    throw error;
  }
};

export const updateUserExperience = async (userId, experienceId, experienceData, accessToken) => {
  const dataToSend = { ...experienceData };
  if (dataToSend.stillWorking) {
    delete dataToSend.stillWorking;
    delete dataToSend.endDate;
  }

  const res = await fetch(`${API_URL}/experience/${userId}/update/${experienceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
  });

  if (!res.ok) {
    let errorMsg = `HTTP error! status: ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.message || JSON.stringify(errData);
    } catch {}
    throw new Error(errorMsg);
  }

  return true; 
};
export const deleteUserExperience = async (userId, experienceId, accessToken) => {
  const res = await fetch(`${API_URL}/experience/${userId}/delete/${experienceId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    let errorMsg = `HTTP error! status: ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.message || JSON.stringify(errData);
    } catch {}
    throw new Error(errorMsg);
  }

  return true; 
};
// Favorites Management Functions
export const fetchFavoriteUsers = async (accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favourites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching favorite users:', error);
    throw error;
  }
};

export const addFavorite = async (userId, accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favourites/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // try to parse error body, but only if exists
      const text = await response.text();
      const errorData = text ? JSON.parse(text) : {};
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : true; // return true if empty
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (userId, accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favourites/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      const errorData = text ? JSON.parse(text) : {};
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return true; // success
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};


export const checkIsFavorite = async (userId, accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favourites/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
// User Roles Management Functions
export const fetchUserRoles = async (accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};


// Filter users
export const filterUsers = async (filters, accessToken) => {
  const queryParams = new URLSearchParams();
  
  // Simple filters
  if (filters.minAge) queryParams.append("MinAge", filters.minAge);
  if (filters.maxAge) queryParams.append("MaxAge", filters.maxAge);
  if (filters.minHeight) queryParams.append("MinHeight", filters.minHeight);
  if (filters.maxHeight) queryParams.append("MaxHeight", filters.maxHeight);
  if (filters.minWeight) queryParams.append("MinWeight", filters.minWeight);
  if (filters.maxWeight) queryParams.append("MaxWeight", filters.maxWeight);

  // Array filters – append each value separately
  if (filters.hairColors?.length) {
    filters.hairColors.forEach(color => queryParams.append("HairColor", color));
  }
  if (filters.clothingSizes?.length) {
    filters.clothingSizes.forEach(size => queryParams.append("ClothingSize", size));
  }
  if (filters.cities?.length) {
    filters.cities.forEach(city => queryParams.append("City", city));
  }

  // Pagination
  queryParams.append("pageNumber", filters.pageNumber || 1);
  queryParams.append("pageSize", filters.pageSize || 12);

  const response = await fetch(
    `${API_BASE_URL}/FilterUsers?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch filtered users");
  }

  const data = await response.json();

  return {
    users: Array.isArray(data) ? data : data.users || data.items || [],
    totalCount:
      data.totalCount ||
      data.total ||
      (Array.isArray(data) ? data.length : 0),
    currentPage: data.currentPage || data.page || filters.pageNumber || 1,
    totalPages:
      data.totalPages ||
      Math.ceil(
        (data.totalCount ||
          data.total ||
          (Array.isArray(data) ? data.length : 0)) /
          (filters.pageSize || 12)
      ),
  };
};

/**
 * Fetch all pending users
 * @param {string} accessToken - Authentication token
 * @returns {Promise<Array>} - Array of pending users
 */
export const fetchPendingUsers = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/user/Pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pending users');
  }

  return await response.json();
};

/**
 * Update user status (accept or reject)
 * @param {string} userId - User ID
 * @param {string} status - Status to set ("Active" or "Rejected")
 * @param {string} accessToken - Authentication token
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUserStatus = async (userId, status, accessToken) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/statusUpdate`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json-patch+json',
      'accept': 'application/json'
    },
    body: JSON.stringify({
      status: status
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to update user status to ${status}`);
  }

  return await response.json();
};

/**
 * Fetch all pending photos for all users
 * @param {string} accessToken - Authentication token
 * @returns {Promise<Array>} - Array of pending photos
 */
export const fetchAllPendingPhotos = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/api/users/photos/allPending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all pending photos');
  }

  return await response.json();
};


/**
 * Update photo status (accept or reject)
 * @param {string} userId - User ID
 * @param {string} photoId - Photo ID
 * @param {string} status - Status to set ("Active" or "Rejected")
 * @param {string} accessToken - Authentication token
 * @returns {Promise<Object>} - Updated photo data
 */
export const updatePhotoStatus = async (photosToUpdate, token) => {
  
  const payload = photosToUpdate.map(photo => ({
    id: photo.id,
    photoStatus: photo.photoStatus // or photoStatus directly
  }));

  const response = await fetch(`${API_BASE_URL}/api/users/photos/updateStatus`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update photo status');
  }

  return true;
};

export async function sendEmail(data) {
  try {
    const response = await fetch("/email/email/form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Nie udało się wysłać wiadomości");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}

