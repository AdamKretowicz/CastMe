// src/pages/ProfilePage.jsx - Updated with proper favorites API

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  fetchUserProfile, 
  getPhotoUrl, 
  checkIsFavorite, 
  addFavorite, 
  removeFavorite 
} from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Ruler, 
  Weight, 
  Info, 
  Briefcase,
  Shirt, 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Smartphone, 
  Mail, 
  Scissors, 
  Users, 
  Mars, 
  Venus, 
  Home, 
  Globe 
} from "lucide-react";

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { accessToken, currentUser, loading: authLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const photosPerPage = 8;
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isSelfProfile = String(currentUser?.id) === String(userId);
  const isAdmin = currentUser?.role === 'Admin';
  console.log(currentUser?.role)
  console.log(isAdmin) 
  const fieldIcons = {
    userName: <User size={18} className="inline mr-2" />,
    location: <MapPin size={18} className="inline mr-2" />,
    age: <Calendar size={18} className="inline mr-2" />,
    height: <Ruler size={18} className="inline mr-2" />,
    weight: <Weight size={18} className="inline mr-2" />,
    role: <Briefcase size={18} className="inline mr-2" />,
    phone: <Smartphone size={18} className="inline mr-2" />,
    email: <Mail size={18} className="inline mr-2" />,
    hairColor: <Scissors size={18} className="inline mr-2" />,
    clothingSize: <Shirt size={18} className="inline mr-2" />, 
    gender: <Users size={18} className="inline mr-2" />,
    city: <Home size={18} className="inline mr-2" />,
    country: <Globe size={18} className="inline mr-2" />,
  };

  const formatField = (key, value) => {
    if (value === null || value === undefined || value === "") return null;

    switch (key) {
      case "gender":
        return value === 1 ? "Mężczyzna" : value === 2 ? "Kobieta" : "Inna";
      case "height":
        return `${value} cm`;
      case "weight":
        return `${value} kg`;
      default:
        return value;
    }
  };

  useEffect(() => {
  setIsFavorite(false);
  setFavoriteLoading(false);
  loadProfileData();
}, [userId]);



  useEffect(() => {
    if (authLoading) return; // wait until auth context finishes loading

    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (!userId) {
      setError("Nieprawidłowy identyfikator użytkownika");
      setLoading(false);
      return;
    }

    loadProfileData();
  }, [userId, accessToken, authLoading, navigate]);



  const loadProfileData = async () => {
    setLoading(true);
    try {
      const profileData = await fetchUserProfile(userId, accessToken);
      setSelectedUser(profileData);

      // Check if this user is in favorites (only for admin and not self profile)
      if (currentUser?.role === 'admin' && !isSelfProfile) {
        try {
          const favoriteStatus = await checkIsFavorite(userId, accessToken);
          setIsFavorite(favoriteStatus);
        } catch (err) {
          console.error('Error checking favorites:', err);
        }
      }


    } catch (err) {
      setError(err.message || "Błąd pobierania profilu");
    } finally {
      setLoading(false);
    }
  };

  const allPhotos = selectedUser?.photos || [];

  // Modal handlers
  const openModal = (index) => setModalPhotoIndex(index);
  const closeModal = () => setModalPhotoIndex(null);

  const prevPhoto = useCallback(() => {
    if (modalPhotoIndex === null) return;
    setModalPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  }, [modalPhotoIndex, allPhotos.length]);

  const nextPhoto = useCallback(() => {
    if (modalPhotoIndex === null) return;
    setModalPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  }, [modalPhotoIndex, allPhotos.length]);

  const toggleFavorite = useCallback(async () => {
    if (!isAdmin || isSelfProfile || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(userId, accessToken);
        setIsFavorite(false);
      } else {
        await addFavorite(userId, accessToken);
        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.message || "Błąd zmiany statusu ulubionych");
      // Revert the state on error
      console.error('Favorite toggle error:', err);
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, userId, accessToken, isAdmin, isSelfProfile, favoriteLoading]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKey = (e) => {
      if (modalPhotoIndex === null) return;
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalPhotoIndex, prevPhoto, nextPhoto]);

  if (loading) return <div className="text-center py-10">Ładowanie profilu...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!selectedUser) return <div className="text-center py-10">Nie znaleziono profilu</div>;

  const age = selectedUser.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(selectedUser.dateOfBirth).getTime()) / 31557600000)
    : null;
  const location = selectedUser.city && selectedUser.country ? `${selectedUser.city}, ${selectedUser.country}` : null;
  const mainPhoto = selectedUser.photos?.find(p => p.isMain) || selectedUser.photos?.[0];

  const dynamicInfoFields = [
    { label: "Wiek", key: "age", value: age },
    { label: "Lokalizacja", key: "location", value: location },
    { label: "Nazwa użytkownika", key: "userName", value: selectedUser.userName },
    { label: "Email", key: "email", value: selectedUser.email },
    { label: "Telefon", key: "phone", value: selectedUser.phone },
    { label: "Płeć", key: "gender", value: formatField("gender", selectedUser.gender) },
    { label: "Wzrost", key: "height", value: formatField("height", selectedUser.height) },
    { label: "Waga", key: "weight", value: formatField("weight", selectedUser.weight) },
    { label: "Kolor włosów", key: "hairColor", value: selectedUser.hairColor },
    { label: "Rozmiar ubrań", key: "clothingSize", value: selectedUser.clothingSize },
    { label: "Rola", key: "role", value: selectedUser.role },
  ].filter(f => f.value !== null && f.value !== undefined && f.value !== "");

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  return (
    <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Info section */}
        <Card className="p-6 mb-8 text-center relative">
          <div className="relative inline-block w-48 h-48 rounded-full overflow-hidden border-4 border-[#2b2628] mx-auto">
            {mainPhoto && (
              <img
                src={getPhotoUrl(mainPhoto.url)}
                alt="Main profile"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openModal(0)}
              />
            )}
            <Camera size={24} className="absolute bottom-2 right-2 text-white bg-[#EA1A62] p-1 rounded-full"/>
          </div>
          <h1 className="text-4xl font-bold mt-4">{selectedUser.firstName} {selectedUser.lastName}</h1>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {dynamicInfoFields.map(({ label, key, value }) => (
              <p key={key} className="flex items-center">
                {fieldIcons[key] || null} 
                <span className="mr-1 font-semibold">{label}:</span>
                <span className="font-bold">{value}</span>
              </p>
            ))}
          </div>

          <p className="mt-4 text-lg leading-relaxed">{selectedUser.description}</p>
          
          {/* Favorite button for admin users */}
          {isAdmin && !isSelfProfile && (
            <div className="mt-4">
              <Button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#EA1A62] text-black hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                <Heart size={18} fill={isFavorite ? "white" : "none"} />
                {favoriteLoading 
                  ? 'Ładowanie...' 
                  : isFavorite 
                    ? 'Usuń z ulubionych' 
                    : 'Dodaj do ulubionych'
                }
              </Button>
            </div>
          )}
        </Card>

        {/* Gallery */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Camera size={24} className="mr-2 text-[#EA1A62]" /> Galeria
          </h2>

          {allPhotos?.length > 0 ? (
            <>
              <div className="grid grid-cols-4">
                {allPhotos
                  .slice(currentPage * photosPerPage, (currentPage + 1) * photosPerPage)
                  .map((photo, idx) => {
                    const isLastColumn = (idx + 1) % 4 === 0;
                    const isLastRow =
                      idx >=
                      Math.floor(
                        (Math.min(allPhotos.length, (currentPage + 1) * photosPerPage) -
                          1) /
                          4
                      ) * 4;

                    return (
                      <div
                        key={photo.id}
                        className={`aspect-square cursor-pointer ${
                          !isLastColumn ? "border-r border-white" : ""
                        } ${!isLastRow ? "border-b border-white" : ""}`}
                        onClick={() => openModal(idx + currentPage * photosPerPage)}
                      >
                        <img
                          src={getPhotoUrl(photo.url)}
                          alt="Gallery photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
              </div>

              {/* Pagination controls */}
              <div className="flex justify-center mt-4 gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={(currentPage + 1) * photosPerPage >= allPhotos.length}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <p>Brak zdjęć w galerii</p>
          )}
        </Card>

        {/* Experience */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Briefcase size={24} className="mr-2 text-[#EA1A62]" /> Doświadczenie
          </h2>
          {selectedUser.experiences?.length > 0 ? (
            selectedUser.experiences.map((exp) => (
              <div key={exp.id} className="border-l-4 border-[#EA1A62] pl-4 py-2 mb-4">
                <h3 className="text-xl font-semibold">{exp.projectName}</h3>
                <p className="font-medium">{exp.role}</p>
                <p className="text-sm text-gray-500">
                  {new Date(exp.startDate).toLocaleDateString()} –{" "}
                  {new Date(exp.endDate).toLocaleDateString()}
                </p>
                <p className="mt-2">{exp.description}</p>
                {exp.link && (
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline"
                  >
                    Link
                  </a>
                )}
              </div>
            ))
          ) : (
            <p>Brak doświadczeń do wyświetlenia</p>
          )}
        </Card>

        {/* Edit profile button */}
        {isSelfProfile && (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleEditProfile}
              className="bg-[#EA1A62] text-white px-8 py-3 rounded-full font-bold hover:bg-[#c91653] transition-colors"
            >
              Edytuj profil
            </Button>
          </div>
        )}

        {/* Photo modal */}
        {modalPhotoIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <button className="absolute top-4 right-4 text-white p-2" onClick={closeModal}>
              <X size={28} />
            </button>

            {/* Left arrow */}
            <button
              className="absolute left-4 text-white p-2"
              onClick={prevPhoto}
            >
              <ChevronLeft size={36} />
            </button>

            {/* Right arrow */}
            <button
              className="absolute right-4 text-white p-2"
              onClick={nextPhoto}
            >
              <ChevronRight size={36} />
            </button>

            <img
              src={getPhotoUrl(allPhotos[modalPhotoIndex].url)}
              alt="Full view"
              className="max-h-[90%] max-w-[90%] object-contain rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}