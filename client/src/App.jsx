import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CastingProvider } from "./context/CastingContext";
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

function App() {
  return (
    <AuthProvider>
      <CastingProvider>
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

              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CastingProvider>
    </AuthProvider>
  );
}

export default App;
