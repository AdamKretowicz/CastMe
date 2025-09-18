import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ModelDashboard from "../components/Dashboard/ModelDashboard";
import OrganizerDashboard from "../components/Dashboard/OrganizerDashboard";

const Dashboard = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log("🔑 Zalogowany użytkownik:", currentUser);
      console.log("📌 Role użytkownika:", currentUser.role);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Musisz się zalogować, aby zobaczyć dashboard
          </p>
        </div>
      </div>
    );
  }

  if (currentUser.role === "Admin") {
    return <OrganizerDashboard />;
  }

  return <ModelDashboard />;
};

export default Dashboard;
