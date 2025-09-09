import React, { createContext, useContext, useState } from "react";
import { users } from "../data/users";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState(users);

  const login = (email, password) => {
    const user = usersList.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: "Nieprawidłowy email lub hasło" };
  };

  const register = (userData) => {
    // Check if email already exists
    const emailExists = usersList.find((u) => u.email === userData.email);
    if (emailExists) {
      return {
        success: false,
        error: "Ten adres email jest już zarejestrowany",
      };
    }

    const newUser = {
      ...userData,
      id: usersList.length + 1,
      createdAt: new Date(),
    };

    setUsersList((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    usersList,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
