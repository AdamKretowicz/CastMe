import React, { createContext, useContext, useState } from "react";
import {
  castings as initialCastings,
  applications as initialApplications,
} from "../data/castings";

const CastingContext = createContext();

export const useCasting = () => {
  const context = useContext(CastingContext);
  if (!context) {
    throw new Error("useCasting must be used within a CastingProvider");
  }
  return context;
};

export const CastingProvider = ({ children }) => {
  const [castings, setCastings] = useState(initialCastings);
  const [applications, setApplications] = useState(initialApplications);

  const createCasting = (castingData) => {
    const newCasting = {
      ...castingData,
      id: castings.length + 1,
      status: "active",
      createdAt: new Date(),
      deadline: new Date(castingData.deadline),
    };

    setCastings((prev) => [...prev, newCasting]);
    return { success: true, casting: newCasting };
  };

  const applyToCasting = (castingId, userId, message = "") => {
    // Check if user already applied
    const existingApplication = applications.find(
      (app) => app.castingId === castingId && app.userId === userId
    );

    if (existingApplication) {
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

    setApplications((prev) => [...prev, newApplication]);
    return { success: true, application: newApplication };
  };

  const updateApplicationStatus = (applicationId, status) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
  };

  const getUserApplications = (userId) => {
    return applications.filter((app) => app.userId === userId);
  };

  const getCastingApplications = (castingId) => {
    return applications.filter((app) => app.castingId === castingId);
  };

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
