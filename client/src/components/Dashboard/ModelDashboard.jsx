import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Card from "../UI/Card";
import Button from "../UI/Button";

const ModelDashboard = () => {
  const { currentUser } = useAuth();
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCasting, setSelectedCasting] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  // Zgłoszenia użytkownika z API
  const [userApplications, setUserApplications] = useState([]);

  useEffect(() => {
    const fetchCastings = async () => {
      try {
        const data = await apiFetch("/casting/casting");
        setCastings(data);
      } catch (err) {
        setError("Błąd pobierania castingów");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCastings();
  }, []);

  // Pobierz zgłoszenia użytkownika z API
  useEffect(() => {
    if (!currentUser) return;
    const fetchApplications = async () => {
      try {
        const data = await apiFetch(
          `/casting/casting/participants/${currentUser.id}`
        );
        setUserApplications(data);
        // DEBUG: wypisz currentUser.id i odpowiedź z backendu
        console.log("currentUser.id:", currentUser.id);
        console.log("userApplications (response):", data);
      } catch (err) {
        console.error("Błąd pobierania zgłoszeń użytkownika:", err);
        // Możesz dodać obsługę błędu jeśli chcesz
      }
    };
    fetchApplications();
  }, [currentUser]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pl-PL");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "accepted":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Oczekuje";
      case "accepted":
        return "Zaakceptowany";
      case "rejected":
        return "Odrzucony";
      default:
        return "Nieznany";
    }
  };

  // Obsługa zgłoszenia do castingu przez API
  const handleApply = async (castingId) => {
    try {
      await apiFetch(
        `/casting/casting/${castingId}/participants/${currentUser.id}`,
        {
          method: "POST",
        }
      );
      // Po wysłaniu zgłoszenia odśwież listę zgłoszeń
      const data = await apiFetch(
        `/casting/casting/participants/${currentUser.id}`
      );
      setUserApplications(data);
      setSelectedCasting(null);
      setApplicationMessage("");
      alert("Zgłoszenie zostało wysłane!");
    } catch (err) {
      alert("Błąd wysyłania zgłoszenia");
      console.error("Błąd wysyłania zgłoszenia:", err);
    }
  };

  // Sprawdzanie czy użytkownik już się zgłosił
  const hasApplied = (castingId) => {
    return userApplications.some((app) => app.id === castingId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie castingów...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
            Witaj, {currentUser.firstName}!
          </h1>
          <p className="text-gray-600">
            Zarządzaj swoimi zgłoszeniami i znajdź nowe okazje
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Applications */}
          <div className="lg:col-span-1">
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-[#2B2628]">
                  Moje zgłoszenia
                </h2>
              </Card.Header>
              <Card.Content>
                {userApplications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nie masz jeszcze żadnych zgłoszeń
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userApplications.map((application) => {
                      const casting = castings.find(
                        (c) => c.id === application.castingId
                      );
                      if (!casting) return null;

                      return (
                        <div
                          key={application.id}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <h3 className="font-medium text-gray-900 mb-2 text-sm">
                            {casting.title}
                          </h3>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {getStatusIcon(application.status)}
                            <span className="ml-1">
                              {getStatusText(application.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Zgłoszono: {formatDate(application.appliedAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Available Castings */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-[#2B2628]">
                  Dostępne castingi
                </h2>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  {castings.map((casting) => (
                    <div
                      key={casting.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#2B2628] mb-2">
                            {casting.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {casting.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {casting.maxPlaces} miejsc
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Do: {formatDate(casting.deadline)}
                            </div>
                          </div>
                          {casting.salary && (
                            <div className="text-sm font-medium text-[#EA1A62] mb-3">
                              Wynagrodzenie: {casting.salary}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {casting.roles.map((role, index) => (
                            <span
                              key={typeof role === "string" ? role : role.id || index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {typeof role === "string" ? role : role.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{casting.description}</p>

                      {casting.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {casting.tags.map((tag, index) => (
                            <span
                              key={typeof tag === "string" ? tag : tag.id || index}
                              className="px-2 py-1 bg-[#EA1A62] bg-opacity-10 text-[#EA1A62] text-xs rounded-full"
                            >
                              {typeof tag === "string" ? tag : tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <Button onClick={() => setSelectedCasting(casting)}>
                        Zgłoś się
                      </Button>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>

        </div>
      </div>

      {/* Application Modal */}
      {selectedCasting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#2B2628] mb-4">
              Zgłoś się do: {selectedCasting.title}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wiadomość (opcjonalna)
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62]"
                rows="4"
                placeholder="Opisz dlaczego jesteś idealną osobą do tego castingu..."
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedCasting(null);
                  setApplicationMessage("");
                }}
              >
                Anuluj
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleApply(selectedCasting.id)}
              >
                Wyślij zgłoszenie
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDashboard;
