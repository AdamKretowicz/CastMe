import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext"; // Import AuthContext

const CastingContext = createContext();

export const useCasting = () => {
  const ctx = useContext(CastingContext);
  if (!ctx) throw new Error("useCasting must be used within a CastingProvider");
  return ctx;
};

export const CastingProvider = ({ children }) => {
  const [castings, setCastings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useAuth(); // Pobierz currentUser z AuthContext

  /**
   * Pobieranie wszystkich castingów z API
   */
  const fetchCastings = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("/casting/casting", {
        method: "GET",
      });

      // Sprawdź czy response to tablica czy obiekt z tablicą
      const castingsData = Array.isArray(response)
        ? response
        : response.castings || [];

      setCastings(castingsData);

      return { success: true, castings: castingsData };
    } catch (err) {
      console.error("Błąd podczas pobierania castingów:", err);
      setCastings([]); // Wyczyść na wypadek błędu
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Automatyczne ładowanie castingów przy starcie i zmianie użytkownika
   */
  useEffect(() => {
    // Ładuj castingi gdy:
    // 1. Komponent się zamontuje
    // 2. Zmieni się currentUser
    if (currentUser) {
      fetchCastings();
    }
  }, [currentUser?.id]); // Dependency na ID użytkownika

  /**
   * Tworzenie nowego castingu (API POST)
   */
  const createCasting = async (castingData) => {
    try {
      const newCasting = await apiFetch("/casting/casting", {
        method: "POST",
        body: JSON.stringify(castingData),
      });

      // Dodaj nowy casting do stanu
      setCastings((prev) => [...prev, newCasting]);

      return { success: true, casting: newCasting };
    } catch (err) {
      console.error("Błąd podczas tworzenia castingu:", err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Pobieranie zgłoszeń do konkretnego castingu z API
   */
  const fetchCastingApplications = async (castingId) => {
    try {
      const response = await apiFetch(
        `/casting/casting/${castingId}/applications`,
        {
          method: "GET",
        }
      );

      const applicationsData = Array.isArray(response)
        ? response
        : response.applications || [];

      // Aktualizuj applications w state - zastąp zgłoszenia dla tego castingu
      setApplications((prev) => [
        ...prev.filter((app) => app.castingId !== castingId), // usuń stare
        ...applicationsData, // dodaj nowe
      ]);

      return applicationsData;
    } catch (err) {
      console.error("Błąd podczas pobierania zgłoszeń:", err);
      return [];
    }
  };

  // Reszta funkcji pozostaje bez zmian
  const applyToCasting = (castingId, userId, message = "") => {
    const exists = applications.find(
      (a) => a.castingId === castingId && a.userId === userId
    );
    if (exists) {
      return { success: false, error: "Już zgłosiłeś się do tego castingu" };
    }
    const newApplication = {
      id: applications.length + 1,
      castingId,
      userId,
      status: "pending",
      appliedAt: new Date(),
      message,
    };
    setApplications((p) => [...p, newApplication]);
    return { success: true, application: newApplication };
  };

  const updateApplicationStatus = (applicationId, status) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );
  };

  const getUserApplications = (userId) =>
    applications.filter((a) => a.userId === userId);

  const getCastingApplications = (castingId) =>
    applications.filter((a) => a.castingId === castingId);

  const value = {
    castings,
    applications,
    isLoading,
    fetchCastings,
    fetchCastingApplications,
    createCasting,
    applyToCasting,
    updateApplicationStatus,
    getUserApplications,
    getCastingApplications,
  };

  return (
    <CastingContext.Provider value={value}>{children}</CastingContext.Provider>
  );
};
