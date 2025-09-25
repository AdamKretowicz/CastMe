// src/pages/PendingAccountsPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPendingUsers, updateUserStatus, getPhotoUrl } from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import {
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Palette,
  Tag,
  Camera,
  Check,
  X,
  Users,
  RefreshCw,
  Eye
} from "lucide-react";


export default function PendingAccountsPage() {
  const navigate = useNavigate();
  const { accessToken, currentUser, loading: authLoading } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingUsers, setProcessingUsers] = useState(new Set());


  // Wait for auth context before proceeding
  useEffect(() => {
    if (authLoading) return; // wait until auth context finishes loading
    if (!currentUser) return;
    if (!accessToken) {
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
      console.log("Fetching pending users with token:", accessToken);
      const users = await fetchPendingUsers(accessToken);
      console.log("Pending users:", users);
      setPendingUsers(users || []);
    } catch (err) {
      console.error("Error fetching pending users:", err);
      setError(err.message || "Błąd pobierania oczekujących kont");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, status, event) => {
    event.stopPropagation();
    const statusText = status === "Active" ? "zaakceptować" : "odrzucić";
    if (!window.confirm(`Czy na pewno chcesz ${statusText} tego użytkownika?`)) return;

    setProcessingUsers((prev) => new Set(prev).add(userId));

    try {
      await updateUserStatus(userId, status, accessToken);
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      const message =
        status === "Active"
          ? "Użytkownik został zaakceptowany"
          : "Użytkownik został odrzucony";
      alert(message);
    } catch (err) {
      console.error("Error updating user status:", err);
      setError(
        err.message || `Błąd ${status === "Active" ? "akceptowania" : "odrzucania"} użytkownika`
      );
    } finally {
      setProcessingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  if (loading) {
    return (
      <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
        <div className="max-w-4xl mx-auto text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA1A62] mx-auto"></div>
          <p className="mt-2">Ładowanie oczekujących kont...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
        <div className="max-w-4xl mx-auto text-center text-red-500 py-10">{error}</div>
        <div className="text-center">
          <Button onClick={loadPendingUsers}>
            <RefreshCw size={16} className="mr-2" />
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center">
            <Clock size={32} className="mr-3 text-[#EA1A62]" />
            Oczekujące konta
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {pendingUsers.length} {pendingUsers.length === 1 ? "konto oczekuje" : "kont oczekuje"} na zatwierdzenie
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={loadPendingUsers} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Odśwież
          </Button>
        </div>

        {/* No Pending Users */}
        {pendingUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-600">Brak oczekujących kont</h2>
            <p className="text-gray-500">Wszystkie konta zostały już zatwierdzone lub odrzucone.</p>
          </Card>
        ) : (
          /* Pending Users List */
          <div className="space-y-4">
            {pendingUsers.map((user) => {
              const age = calculateAge(user.dateOfBirth);
              const location =
                user.city && user.country
                  ? `${user.city}, ${user.country}`
                  : user.city || user.country || null;
              const isProcessing = processingUsers.has(user.id);

              return (
                <Card
                  key={user.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* User Photo */}
                        <div className="md:w-48 w-full h-48 md:h-auto bg-gray-200 flex-shrink-0 relative overflow-hidden rounded-lg">
                        {user.mainPhoto ? (
                        <img
                            src={getPhotoUrl(user.mainPhoto.url)}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Camera size={32} className="text-gray-400" />
                        </div>
                        )}
                        </div>

                    {/* User Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          {/* Name and Basic Info */}
                          <div className="mb-4">
                            <h2 className="text-2xl font-bold text-[#2b2628] mb-2">
                              {user.firstName} {user.lastName}
                            </h2>
                            <div className="flex items-center text-gray-600 mb-1">
                              <User size={16} className="mr-2" />
                              <span className="font-medium">@{user.userName}</span>
                              <span className="mx-2">•</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{user.role}</span>
                            </div>
                            {location && (
                              <div className="flex items-center text-gray-600 mb-1">
                                <MapPin size={16} className="mr-2" />
                                {location}
                              </div>
                            )}
                          </div>

                          {/* Contact & Personal Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              {user.email && (
                                <div className="flex items-center text-gray-600">
                                  <Mail size={16} className="mr-2" />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center text-gray-600">
                                  <Phone size={16} className="mr-2" />
                                  <span className="text-sm">{user.phone}</span>
                                </div>
                              )}
                              {age && (
                                <div className="flex items-center text-gray-600">
                                  <Calendar size={16} className="mr-2" />
                                  <span className="text-sm">{age} lat ({formatDate(user.dateOfBirth)})</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              {user.height && (
                                <div className="flex items-center text-gray-600">
                                  <Ruler size={16} className="mr-2" />
                                  <span className="text-sm">{user.height} cm</span>
                                </div>
                              )}
                              {user.weight && (
                                <div className="flex items-center text-gray-600">
                                  <Weight size={16} className="mr-2" />
                                  <span className="text-sm">{user.weight} kg</span>
                                </div>
                              )}
                              {user.hairColor && (
                                <div className="flex items-center text-gray-600">
                                  <Palette size={16} className="mr-2" />
                                  <span className="text-sm">{user.hairColor}</span>
                                </div>
                              )}
                              {user.clothingSize && (
                                <div className="flex items-center text-gray-600">
                                  <Tag size={16} className="mr-2" />
                                  <span className="text-sm">Rozmiar: {user.clothingSize}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {user.description && (
                            <div className="mb-4">
                              <p className="text-gray-700 text-sm leading-relaxed">{user.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 md:ml-6">
                          <Button
                            onClick={(e) => handleUserClick(user.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Eye size={16} className="mr-2" />
                            Profil
                          </Button>

                          <Button
                            onClick={(e) => handleStatusUpdate(user.id, 'Active', e)}
                            variant="primary"
                            size="sm"
                            disabled={isProcessing}
                            className="flex items-center bg-green-600 hover:bg-green-700"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Check size={16} className="mr-2" />
                            )}
                            Zaakceptuj
                          </Button>

                          <Button
                            onClick={(e) => handleStatusUpdate(user.id, 'Rejected', e)}
                            variant="primary"
                            size="sm"
                            disabled={isProcessing}
                            className="flex items-center bg-red-600 hover:bg-red-700"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <X size={16} className="mr-2" />
                            )}
                            Odrzuć
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
