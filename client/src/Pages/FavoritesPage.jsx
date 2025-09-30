// src/pages/FavoritesPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  fetchUserRoles, 
  fetchFavoriteUsers, 
  fetchUserProfile,
  getPhotoUrl,
  removeFavorite 
} from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { 
  Heart, 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Users,
  Camera,
  Trash2,
  User,
  ArrowLeft
} from "lucide-react";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { accessToken, currentUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [expandedRoles, setExpandedRoles] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfiles, setUserProfiles] = useState({}); // Cache for user profiles
  const [loadingProfiles, setLoadingProfiles] = useState(new Set());

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'Admin') {
      navigate("/");
      return;
    }

    if (!accessToken) {
      navigate("/login");
      return;
    }

    loadInitialData();
  }, [accessToken, currentUser, navigate]);

  const loadInitialData = async () => {
  setLoading(true);
  try {
    const [rolesData, favoritesData] = await Promise.all([
      fetchUserRoles(accessToken),
      fetchFavoriteUsers(accessToken)
    ]);

    setRoles(rolesData || []);
    setFavoriteUsers(favoritesData || []);
    
    // // Auto-expand roles that have favorites
    // const rolesWithFavorites = new Set();
    // favoritesData?.forEach(user => {
    //   if (user.role) {
    //     rolesWithFavorites.add(user.role);
    //   }
    // });
    // setExpandedRoles(rolesWithFavorites);

    // Load profiles for all users in expanded roles
    favoritesData?.forEach(user => loadUserProfile(user.id));

  } catch (err) {
    setError(err.message || "Błąd pobierania danych");
  } finally {
    setLoading(false);
  }
};


  const loadUserProfile = async (userId) => {
    if (userProfiles[userId] || loadingProfiles.has(userId)) return;

    setLoadingProfiles(prev => new Set(prev).add(userId));
    try {
      const profile = await fetchUserProfile(userId, accessToken);
      setUserProfiles(prev => ({
        ...prev,
        [userId]: profile
      }));
    } catch (err) {
      console.error(`Error loading profile for user ${userId}:`, err);
    } finally {
      setLoadingProfiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const toggleRoleExpansion = (roleName) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleName)) {
        newSet.delete(roleName);
      } else {
        newSet.add(roleName);
        // Load profiles for users in this role
        const usersInRole = favoriteUsers.filter(user => user.role === roleName);
        usersInRole.forEach(user => loadUserProfile(user.id));
      }
      return newSet;
    });
  };

  const handleRemoveFavorite = async (userId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika z ulubionych?")) return;

    try {
      await removeFavorite(userId, accessToken);
      setFavoriteUsers(prev => prev.filter(user => user.id !== userId));
      
      // Remove from userProfiles cache
      setUserProfiles(prev => {
        const newProfiles = { ...prev };
        delete newProfiles[userId];
        return newProfiles;
      });
      
    } catch (err) {
      setError(err.message || "Błąd usuwania z ulubionych");
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) return <div className="text-center py-10">Ładowanie ulubionych...</div>;

  if (error) {
    return (
      <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-500 py-10">{error}</div>
        </div>
      </div>
    );
  }

  // Group favorite users by role
  const favoritesByRole = favoriteUsers.reduce((acc, user) => {
    const role = user.role || "Bez roli";
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  // Ensure all roles are included even if they don't have favorites
  roles.forEach(role => {
    if (!favoritesByRole[role.name]) {
      favoritesByRole[role.name] = [];
    }
  });

  const totalFavorites = favoriteUsers.length;

  return (
    <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
         
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center">
              <Heart size={32} className="mr-3 text-[#EA1A62]" />
              Ulubieni użytkownicy
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Łącznie: {totalFavorites} {totalFavorites === 1 ? 'użytkownik' : 'użytkowników'}
            </p>
          </div>
          <div></div> {/* Spacer */}
        </div>

        {totalFavorites === 0 ? (
          <Card className="p-8 text-center">
            <Heart size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-600">Brak ulubionych</h2>
            <p className="text-gray-500">Nie masz jeszcze żadnych ulubionych użytkowników.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(favoritesByRole).map(([roleName, users]) => {
              const isExpanded = expandedRoles.has(roleName);
              const hasUsers = users.length > 0;

              return (
                <Card key={roleName} className="overflow-hidden">
                  {/* Role Header */}
                  <button
                    onClick={() => toggleRoleExpansion(roleName)}
                    className={`w-full p-4 flex items-center justify-between transition-colors ${
                      hasUsers ? 'hover:bg-gray-50' : 'opacity-60'
                    }`}
                    disabled={!hasUsers}
                  >
                    <div className="flex items-center">
                      <Users size={24} className="mr-3 text-[#EA1A62]" />
                      <h2 className="text-2xl font-semibold">{roleName}</h2>
                      <span className="ml-3 bg-[#EA1A62] text-white px-3 py-1 rounded-full text-sm">
                        {users.length}
                      </span>
                    </div>
                    {hasUsers && (
                      isExpanded ? 
                        <ChevronDown size={24} className="text-gray-400" /> : 
                        <ChevronRight size={24} className="text-gray-400" />
                    )}
                  </button>

                  {/* Users Grid */}
                  {isExpanded && hasUsers && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                        {users.map(user => {
                          const profile = userProfiles[user.id];
                          const isLoadingProfile = loadingProfiles.has(user.id);
                          const mainPhoto = profile?.photos?.find(p => p.isMain) || profile?.photos?.[0];
                          const location = profile?.city && profile?.country ? 
                            `${profile.city}, ${profile.country}` : 
                            profile?.city || profile?.country || null;

                          return (
                            <div
                              key={user.id}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                              {/* User Photo */}
                              <div className="relative">
                                <div 
                                  className="w-full h-48 bg-gray-200 cursor-pointer overflow-hidden"
                                  onClick={() => handleUserClick(user.id)}
                                >
                                  {isLoadingProfile ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA1A62]"></div>
                                    </div>
                                  ) : mainPhoto ? (
                                    <img
                                      src={getPhotoUrl(mainPhoto.url)}
                                      alt={`${profile.firstName} ${profile.lastName}`}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                      <Camera size={32} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Remove from favorites button */}
                                <button
                                  onClick={() => handleRemoveFavorite(user.id)}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                                  title="Usuń z ulubionych"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {/* User Info */}
                              <div className="p-4">
                                {isLoadingProfile ? (
                                  <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                  </div>
                                ) : profile ? (
                                  <>
                                    <h3 
                                      className="font-semibold text-lg cursor-pointer hover:text-[#EA1A62] transition-colors"
                                      onClick={() => handleUserClick(user.id)}
                                    >
                                      {profile.firstName} {profile.lastName}
                                    </h3>
                                    {location && (
                                      <p className="text-gray-600 text-sm flex items-center mt-1">
                                        <MapPin size={14} className="mr-1" />
                                        {location}
                                      </p>
                                    )}

                                  </>
                                ) : (
                                  <div className="text-center py-2">
                                    <User size={24} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500 text-sm">Błąd ładowania profilu</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}