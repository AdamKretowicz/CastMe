// src/pages/ProfilePage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserProfile } from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { Heart, Calendar, MapPin, Ruler, Weight, Info, Briefcase, Camera } from "lucide-react";

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { accessToken, currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOrganizer = currentUser?.role === "Organizer";
  const isSelfProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (!userId) {
      setError("Nieprawidłowy identyfikator użytkownika");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchUserProfile(userId, accessToken)
      .then((data) => setSelectedUser(data))
      .catch((err) => setError(err.message || "Błąd pobierania profilu"))
      .finally(() => setLoading(false));
  }, [userId, accessToken, navigate]);

  if (loading) return <div className="text-center py-10">Ładowanie profilu...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!selectedUser) return <div className="text-center py-10">Nie znaleziono profilu</div>;

  const age = selectedUser.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(selectedUser.dateOfBirth).getTime()) / 31557600000)
    : null;
  const location = selectedUser.city && selectedUser.country ? `${selectedUser.city}, ${selectedUser.country}` : null;
  const mainPhoto = selectedUser.photos?.find(p => p.isMain) || selectedUser.photos?.[0];
  const otherPhotos = selectedUser.photos?.filter(p => !p.isMain);

  return (
    <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Sekcja Nagłówka */}
        <div className="relative text-center mb-8">
          {/* Główne zdjęcie */}
          <div className="relative inline-block w-48 h-48 rounded-full overflow-hidden border-4 border-[#2b2628]">
            {mainPhoto && <img src={mainPhoto.url} alt="Main profile" className="w-full h-full object-cover" />}
            <Camera size={24} className="absolute bottom-2 right-2 text-white bg-[#EA1A62] p-1 rounded-full"/>
          </div>
          <h1 className="text-4xl font-bold mt-4">{selectedUser.firstName} {selectedUser.lastName}</h1>
          {!isSelfProfile && (
            <Heart size={24} className="absolute top-0 right-0 text-[#EA1A62] cursor-pointer" />
          )}
        </div>

        {/* Galeria zdjęć */}
        {otherPhotos?.length > 0 && (
          <div className="flex justify-center gap-2 mb-8 overflow-x-auto">
            {otherPhotos.map(photo => (
              <img key={photo.id} src={photo.url} alt="Gallery photo" className="w-16 h-16 object-cover rounded-lg border-2 border-[#2b2628] cursor-pointer" />
            ))}
          </div>
        )}

        {/* Sekcja Informacji */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            <Info size={24} className="inline mr-2 text-[#EA1A62]" /> O mnie
          </h2>
          <p className="text-lg leading-relaxed">{selectedUser.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <p><Calendar size={18} className="inline mr-2" /> Wiek: <span className="font-bold">{age || "N/A"}</span></p>
            <p><MapPin size={18} className="inline mr-2" /> Lokalizacja: <span className="font-bold">{location || "N/A"}</span></p>
            <p><Ruler size={18} className="inline mr-2" /> Wzrost: <span className="font-bold">{selectedUser.height || "N/A"} cm</span></p>
            <p><Weight size={18} className="inline mr-2" /> Waga: <span className="font-bold">{selectedUser.weight || "N/A"} kg</span></p>
            <p><Briefcase size={18} className="inline mr-2" /> Rola: <span className="font-bold">{selectedUser.role}</span></p>
          </div>
        </Card>

        {/* Sekcja Doświadczeń */}
        {selectedUser.experiences?.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              <Briefcase size={24} className="inline mr-2 text-[#EA1A62]" /> Doświadczenie
            </h2>
            {selectedUser.experiences.map((exp) => (
              <div key={exp.id} className="border-l-4 border-[#EA1A62] pl-4 py-2 mb-4">
                <h3 className="text-xl font-semibold">{exp.projectName}</h3>
                <p className="font-medium">{exp.role}</p>
                <p className="text-sm text-gray-500">
                  {new Date(exp.startDate).toLocaleDateString()} - {new Date(exp.endDate).toLocaleDateString()}
                </p>
                <p className="mt-2">{exp.description}</p>
              </div>
            ))}
          </Card>
        )}

        {/* Przycisk edycji */}
        {isSelfProfile && (
          <div className="text-center mt-8">
            <Button className="bg-[#EA1A62] text-white px-8 py-3 rounded-full font-bold">Edytuj profil</Button>
          </div>
        )}
      </div>
    </div>
  );
}