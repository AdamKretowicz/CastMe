import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "../utils/api";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
  const saved = localStorage.getItem("currentUser");
  return saved ? JSON.parse(saved) : null;
});

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );

  // 🔑 Logowanie
  const login = async (userName, password) => {
    try {
      const res = await apiFetch("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({ userName, password }),
      });
      console.log("Login response:", res);
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setCurrentUser(res.user);

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("currentUser", JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Nieprawidłowe dane logowania" };
    }
  };

  // 🔑 Rejestracja (multipart/form-data)
  const register = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (Array.isArray(userData[key])) {
          userData[key].forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, userData[key]);
        }
      });

      const res = await apiFetch("/api/Auth/register", {
        method: "POST",
        body: formData,
      });

      setCurrentUser(res);

      return { success: true, user: res };
    } catch (err) {
      console.error("Register error:", err);
      return { success: false, error: "Nie udało się zarejestrować" };
    }
  };

  // 🔑 Wylogowanie
const logout = () => {
  setCurrentUser(null);
  setAccessToken(null);
  setRefreshToken(null);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
};


  const value = {
    currentUser,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
