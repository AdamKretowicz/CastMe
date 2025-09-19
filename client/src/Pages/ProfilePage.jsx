// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserProfile, getPhotoUrl } from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { Heart, Calendar, MapPin, Ruler, Weight, Info, Briefcase, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { accessToken, currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(null); // index of photo in otherPhotos
  const [currentPage, setCurrentPage] = useState(0);
  const photosPerPage = 8; // 2 rows of 4 photos

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

  const allPhotos = selectedUser?.photos || [];
  // Handlers for modal
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

  // Keyboard navigation
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 justify-center">
            <p><Calendar size={18} className="inline mr-2" /> Wiek: <span className="font-bold">{age || "N/A"}</span></p>
            <p><MapPin size={18} className="inline mr-2" /> Lokalizacja: <span className="font-bold">{location || "N/A"}</span></p>
            <p><Ruler size={18} className="inline mr-2" /> Wzrost: <span className="font-bold">{selectedUser.height || "N/A"} cm</span></p>
            <p><Weight size={18} className="inline mr-2" /> Waga: <span className="font-bold">{selectedUser.weight || "N/A"} kg</span></p>
            <p><Briefcase size={18} className="inline mr-2" /> Rola: <span className="font-bold">{selectedUser.role}</span></p>
          </div>

          <p className="mt-4 text-lg leading-relaxed">{selectedUser.description}</p>


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
