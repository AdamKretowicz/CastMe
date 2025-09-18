import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "../utils/api";
// <- upewnij się, że ścieżka jest poprawna

const CastingContext = createContext();

export const useCasting = () => {
  const ctx = useContext(CastingContext);
  if (!ctx) throw new Error("useCasting must be used within a CastingProvider");
  return ctx;
};

export const CastingProvider = ({ children }) => {
  const [castings, setCastings] = useState([]);
  const [applications, setApplications] = useState([]);

  /**
   * Tworzenie nowego castingu (API POST)
   */
  const createCasting = async (castingData) => {
    try {
      const newCasting = await apiFetch("/casting/casting", {
        method: "POST",
        body: JSON.stringify(castingData),
      });

      setCastings((prev) => [...prev, newCasting]); // odśwież listę

      return { success: true, casting: newCasting };
    } catch (err) {
      console.error("Błąd podczas tworzenia castingu:", err);
      return { success: false, error: err.message };
    }
  };

  // Etap 2 i 3 (apply, statusy) na razie lokalnie
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
