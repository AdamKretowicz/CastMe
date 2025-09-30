// src/pages/PendingAccountsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchPendingUsers,
  updateUserStatus,
  getPhotoUrl,
  fetchPendingUserPhotos,
  updateUserPhotoStatus
} from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { Clock, User, Mail, MapPin, Phone, Calendar, Ruler, Weight, Palette, Tag, Eye, Users, RefreshCw } from "lucide-react";

export default function PendingAccountsPage() {
  const navigate = useNavigate();
  const { accessToken, currentUser, loading: authLoading } = useAuth();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState(null);
  const [processingUsers, setProcessingUsers] = useState(new Set());
  const [currentTab, setCurrentTab] = useState("konta"); // "konta" | "zdjecia"

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || !accessToken) {
      navigate("/login");
      return;
    }
    if (currentUser.role !== "Admin") {
      navigate("/");
      return;
    }

    loadPendingUsers();
  }, [authLoading, currentUser, accessToken, navigate]);

  const loadPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await fetchPendingUsers(accessToken);
      setPendingUsers(users || []);
    } catch (err) {
      setError(err.message || "Błąd pobierania oczekujących kont");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPhotos = async () => {
    if (!accessToken) return;
    setLoadingPhotos(true);
    try {
      const usersWithPendingPhotos = await fetchPendingUsers(accessToken);
      const photoData = await Promise.all(
        usersWithPendingPhotos.map(async (user) => {
          const photos = await fetchPendingUserPhotos(user.id, accessToken);
          return {
            userId: user.id,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            photos,
          };
        })
      );
      setPendingPhotos(photoData);
    } catch (err) {
      console.error("Error loading pending photos:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    if (currentTab === "zdjecia") {
      loadPendingPhotos();
    }
  }, [currentTab]);

  const handleStatusUpdate = async (userId, status, event) => {
    event.stopPropagation();
    const statusText = status === "Active" ? "zaakceptować" : "odrzucić";
    if (!window.confirm(`Czy na pewno chcesz ${statusText} tego użytkownika?`)) return;

    setProcessingUsers((prev) => new Set(prev).add(userId));
    try {
      await updateUserStatus(userId, status, accessToken);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      alert(status === "Active" ? "Użytkownik zaakceptowany" : "Użytkownik odrzucony");
    } catch (err) {
      console.error(err);
      setError(err.message || "Błąd aktualizacji statusu użytkownika");
    } finally {
      setProcessingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleUserClick = (userId) => navigate(`/profile/${userId}`);

  const handlePhotoStatus = async (photoId, status, userId) => {
    try {
      await updateUserPhotoStatus(photoId, status, accessToken);
      setPendingPhotos((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? { ...u, photos: u.photos.filter((p) => p.id !== photoId) }
            : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoBatchStatus = async (userId, status) => {
    const userPhotos = pendingPhotos.find((u) => u.userId === userId)?.photos || [];
    await Promise.all(userPhotos.map((p) => updateUserPhotoStatus(p.id, status, accessToken)));
    setPendingPhotos((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, photos: [] } : u))
    );
  };

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div className="bg-white min-h-screen p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${currentTab === "konta" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setCurrentTab("konta")}
          >
            Konta
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${currentTab === "zdjecia" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setCurrentTab("zdjecia")}
          >
            Zdjęcia
          </button>
        </div>

        {/* Konta Tab */}
        {currentTab === "konta" && (
          <>
            {pendingUsers.length === 0 ? (
              <Card className="p-8 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-600">
                  Brak oczekujących kont
                </h2>
              </Card>
            ) : (
              <div className="space-y-6">
                {pendingUsers.map((user) => {
                  const age = user.dateOfBirth
                    ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                    : null;
                  const location = user.city && user.country ? `${user.city}, ${user.country}` : user.city || user.country || null;

                  return (
                    <Card
                      key={user.id}
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                              <User className="text-[#EA1A62]" size={20} />
                              {user.firstName} {user.lastName}
                            </h2>
                            {user.email && <p className="text-gray-600 text-sm mt-1 flex items-center gap-1"><Mail size={14} />{user.email}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={(e) => handleStatusUpdate(user.id, "Active", e)} disabled={processingUsers.has(user.id)} className="bg-green-600 text-white">Akceptuj</Button>
                            <Button onClick={(e) => handleStatusUpdate(user.id, "Rejected", e)} disabled={processingUsers.has(user.id)} className="bg-red-600 text-white">Odrzuć</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Zdjęcia Tab */}
        {currentTab === "zdjecia" && (
          <div className="space-y-6">
            {loadingPhotos ? (
              <div>Ładowanie zdjęć...</div>
            ) : pendingPhotos.length === 0 ? (
              <div className="text-center text-gray-500">Brak oczekujących zdjęć</div>
            ) : (
              pendingPhotos.map((user) => (
                <Card key={user.userId} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{user.firstName} {user.lastName} (@{user.userName})</h3>
                    <div className="flex gap-2">
                      <Button onClick={() => handlePhotoBatchStatus(user.userId, "Active")}>Zaakceptuj wszystkie</Button>
                      <Button onClick={() => handlePhotoBatchStatus(user.userId, "Rejected")}>Odrzuć wszystkie</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {user.photos.map((photo) => (
                      <div key={photo.id} className="relative border rounded overflow-hidden">
                        <img src={getPhotoUrl(photo.url)} className="w-full h-32 object-cover" />
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          <Button size="sm" onClick={() => handlePhotoStatus(photo.id, "Active", user.userId)}>✔</Button>
                          <Button size="sm" onClick={() => handlePhotoStatus(photo.id, "Rejected", user.userId)}>✖</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
