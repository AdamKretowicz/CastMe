import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CastingProvider } from "./context/CastingContext";
import { FilterProvider } from "./context/FilterProvider";

import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";

import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import Dashboard from "./Pages/Dashboard";
import ProfilePage from "./Pages/ProfilePage";
import AboutPage from "./Pages/About";
import EditProfilePage from "./Pages/EditProfilePage";
import FavoritesPage from "./Pages/FavoritesPage";
import ProfileFilterPage from "./Pages/ProfileFilterPage";
import StatusUpdatePage from "./Pages/StatusUpdatePage";
import ContactPage from "./Pages/ContactPage.jsx";


function App() {
  return (
    <AuthProvider>
      <CastingProvider>
        <FilterProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile/:userId" element={<ProfilePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/edit-profile" element={<EditProfilePage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/filterUsers" element={<ProfileFilterPage />} />
                  <Route path="/pending-accounts" element={<StatusUpdatePage />} />
                  <Route path="/contact-us" element={<ContactPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </FilterProvider>
      </CastingProvider>
    </AuthProvider>
  );
}

export default App;
