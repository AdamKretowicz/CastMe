import React, { createContext, useContext, useEffect, useState } from "react";

const CastingContext = createContext();
const API_URL = "http://localhost:3001";

export function useCasting() {
  const context = useContext(CastingContext);
  if (!context) {
    throw new Error("useCasting must be used within a CastingProvider");
  }
  return context;
}

export const CastingProvider = ({ children }) => {
  const [castings, setCastings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch helpers ---
  const fetchCastings = async () => {
    try {
      const res = await fetch(`${API_URL}/castings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCastings(data);
    } catch (e) {
      console.error("Błąd pobierania castings:", e);
      setError("Nie udało się pobrać castingów");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/applications`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApplications(data);
    } catch (e) {
      console.error("Błąd pobierania applications:", e);
      setError("Nie udało się pobrać zgłoszeń");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchCastings(), fetchApplications()]);
      setLoading(false);
    })();
  }, []);

  // --- Create casting -> POST /castings ---
  const createCasting = async (castingData) => {
    try {
      // Normalizacja pól daty: przechowuj jako ISO/string (JSON Server nie obsługuje typów Date)
      const payload = {
        ...castingData,
        status: castingData.status || "active",
        createdAt: new Date().toISOString(),
        // deadline przychodzi z <input type="date" /> jako "YYYY-MM-DD" — zostawiamy bez zmian
      };

      const res = await fetch(`${API_URL}/castings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      setCastings((prev) => [...prev, created]);
      return { success: true, casting: created };
    } catch (e) {
      console.error("Błąd tworzenia castingu:", e);
      return { success: false, error: "Nie udało się utworzyć castingu" };
    }
  };

  // --- Apply to casting -> POST /applications ---
  const applyToCasting = async (castingId, userId, message = "") => {
    try {
      // Szybka weryfikacja duplikatu po stronie stanu
      const exists = applications.some(
        (a) => a.castingId === castingId && a.userId === userId
      );
      if (exists) {
        return { success: false, error: "Już zgłosiłeś się do tego castingu" };
      }

      const payload = {
        castingId,
        userId,
        status: "pending",
        appliedAt: new Date().toISOString(),
        message,
      };

      const res = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      setApplications((prev) => [...prev, created]);

      return { success: true, application: created };
    } catch (e) {
      console.error("Błąd wysyłania zgłoszenia:", e);
      return { success: false, error: "Nie udało się wysłać zgłoszenia" };
    }
  };

  // --- Update application status -> PATCH /applications/:id ---
  const updateApplicationStatus = async (applicationId, status) => {
    try {
      // Najpierw wysyłamy PATCH
      const res = await fetch(`${API_URL}/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      // Potem synchronizujemy stan
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? updated : a))
      );

      return { success: true, application: updated };
    } catch (e) {
      console.error("Błąd aktualizacji statusu:", e);
      return { success: false, error: "Nie udało się zaktualizować statusu" };
    }
  };

  // --- Getters (ze stanu w pamięci) ---
  const getUserApplications = (userId) =>
    applications.filter((app) => app.userId === userId);

  const getCastingApplications = (castingId) =>
    applications.filter((app) => app.castingId === castingId);

  // Opcjonalny publiczny refresh
  const refresh = async () => {
    await Promise.all([fetchCastings(), fetchApplications()]);
  };

  const value = {
    castings,
    applications,
    loading,
    error,
    createCasting,
    applyToCasting,
    updateApplicationStatus,
    getUserApplications,
    getCastingApplications,
    refresh,
  };

  return (
    <CastingContext.Provider value={value}>{children}</CastingContext.Provider>
  );
};
