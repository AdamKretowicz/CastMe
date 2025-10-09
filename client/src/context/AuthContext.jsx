import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );
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
      localStorage.setItem("currentUser", JSON.stringify(res));

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

  // 🔄 Przywracanie sesji po odświeżeniu
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("currentUser");

    if (token && storedUser) {
      setAccessToken(token);
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // ⏳ Automatyczne wylogowanie po 15 minutach bezczynności
  useEffect(() => {
    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minut
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        alert("Zostałeś automatycznie wylogowany po 15 minutach bezczynności.");
      }, SESSION_TIMEOUT);
    };

    if (currentUser) {
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("click", resetTimer);

      resetTimer(); // uruchom timer po zalogowaniu
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [currentUser]);

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
