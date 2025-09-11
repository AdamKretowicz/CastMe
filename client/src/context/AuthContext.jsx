import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);

  // 🔥 Pobranie użytkowników z db.json przy starcie
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:3001/users");
        const data = await res.json();
        setUsersList(data);
      } catch (err) {
        console.error("Błąd pobierania użytkowników:", err);
      }
    };
    fetchUsers();
  }, []);

  // 🔑 Logowanie
  const login = async (email, password) => {
    try {
      const res = await fetch(
        `http://localhost:3001/users?email=${email}&password=${password}`
      );
      const data = await res.json();

      if (data.length > 0) {
        setCurrentUser(data[0]);
        return { success: true, user: data[0] };
      }
      return { success: false, error: "Nieprawidłowy email lub hasło" };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Błąd połączenia z serwerem" };
    }
  };

  // 🔑 Rejestracja
  const register = async (userData) => {
    try {
      // sprawdzanie czy email istnieje
      const emailCheck = await fetch(
        `http://localhost:3001/users?email=${userData.email}`
      );
      const existingUsers = await emailCheck.json();
      if (existingUsers.length > 0) {
        return {
          success: false,
          error: "Ten adres email jest już zarejestrowany",
        };
      }

      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Błąd rejestracji użytkownika");

      const newUser = await res.json();
      setUsersList((prev) => [...prev, newUser]);
      setCurrentUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error: "Nie udało się zarejestrować użytkownika",
      };
    }
  };

  // 🔑 Wylogowanie
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

export { useAuth, AuthProvider };
