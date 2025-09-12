import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Camera, MapPin, Calendar, User, Heart } from "lucide-react";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { apiFetch } from "../utils/api";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kiedy user się zmienia → ustaw aktualny profil
  useEffect(() => {
    if (currentUser) {
      setSelectedUser(currentUser);
    }
  }, [currentUser]);

  // Pobierz użytkowników z backendu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiFetch("/api/User/GetActive");
        setUsers(data);
      } catch (error) {
        console.error("Błąd pobierania użytkowników:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (!currentUser || !selectedUser) {
    return <div>Ładowanie profilu...</div>;
  }

  if (loading) {
    return <div>Ładowanie użytkowników...</div>;
  }

  const otherUsers = users.filter((user) => user.id !== currentUser.id);
  const isOrganizer = currentUser.role === "Organizator";

  const isFavorite = (userId) =>
    userFavorites.some(
      (fav) => fav.organizerId === currentUser.id && fav.userId === userId
    );

  const toggleFavorite = (userId) => {
    if (isFavorite(userId)) {
      setUserFavorites((prev) =>
        prev.filter(
          (fav) =>
            !(fav.organizerId === currentUser.id && fav.userId === userId)
        )
      );
    } else {
      setUserFavorites((prev) => [
        ...prev,
        { organizerId: currentUser.id, userId },
      ]);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pl-PL");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - lista użytkowników (tylko dla organizatora) */}
          {isOrganizer && (
            <div className="lg:col-span-1">
              <Card>
                <Card.Header>
                  <h2 className="text-lg font-semibold text-[#2B2628]">
                    Przeglądaj profile
                  </h2>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {/* Mój profil */}
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser.id === currentUser.id
                          ? "bg-[#EA1A62] bg-opacity-10 border-[#EA1A62] border"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedUser(currentUser)}
                    >
                      <p className="font-medium text-sm">Mój profil</p>
                      <p className="text-xs text-gray-500">
                        {currentUser.role}
                      </p>
                    </div>

                    {/* Inni użytkownicy */}
                    {otherUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUser.id === user.id
                            ? "bg-[#EA1A62] bg-opacity-10 border-[#EA1A62] border"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <p className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                        {isFavorite(user.id) && (
                          <Heart className="w-3 h-3 text-[#EA1A62] fill-current mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Główna sekcja profilu */}
          <div className={isOrganizer ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card>
              <Card.Content className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Zdjęcie */}
                  <div className="flex-shrink-0">
                    <div className="w-40 h-40 bg-gray-200 rounded-xl overflow-hidden">
                      {selectedUser.photos && selectedUser.photos[0] ? (
                        <img
                          src={selectedUser.photos[0]}
                          alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </h1>
                        <div className="flex items-center space-x-4 text-gray-600 mb-4">
                          <span className="px-3 py-1 bg-[#EA1A62] bg-opacity-10 text-[#EA1A62] text-sm rounded-full font-medium">
                            {selectedUser.role}
                          </span>
                          {selectedUser.age && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{selectedUser.age} lat</span>
                            </div>
                          )}
                          {selectedUser.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{selectedUser.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ulubione (tylko organizator + inni użytkownicy) */}
                      {isOrganizer && selectedUser.id !== currentUser.id && (
                        <Button
                          variant={
                            isFavorite(selectedUser.id) ? "primary" : "outline"
                          }
                          onClick={() => toggleFavorite(selectedUser.id)}
                          className="flex items-center"
                        >
                          <Heart
                            className={`w-4 h-4 mr-2 ${
                              isFavorite(selectedUser.id) ? "fill-current" : ""
                            }`}
                          />
                          {isFavorite(selectedUser.id)
                            ? "W ulubionych"
                            : "Dodaj do ulubionych"}
                        </Button>
                      )}
                    </div>

                    {/* Szczegóły */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Informacje podstawowe
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">
                              {selectedUser.email}
                            </span>
                          </div>
                          {selectedUser.height && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Wzrost:</span>
                              <span className="font-medium">
                                {selectedUser.height}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dołączył:</span>
                            <span className="font-medium">
                              {formatDate(selectedUser.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedUser.experience && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            Doświadczenie
                          </h3>
                          <p className="text-sm text-gray-700">
                            {selectedUser.experience}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Portfolio */}
                {selectedUser.photos && selectedUser.photos.length > 1 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-[#2B2628] mb-4">
                      Portfolio
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedUser.photos.slice(1).map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                        >
                          <img
                            src={photo}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edycja profilu (tylko własny) */}
                {selectedUser.id === currentUser.id && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      Edytuj profil
                    </Button>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
