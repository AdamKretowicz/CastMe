import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Card from "../UI/Card";
import Button from "../UI/Button";

// EN(PascalCase) → PL (fallback: obsługa również już-polskich etykiet)
const ROLE_PL = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
  Fotograf: "Fotograf",
  Projektant: "Projektant",
  Wolontariusz: "Wolontariusz",
};

// Ujednolicenie nazw ról na EN(PascalCase), żeby liczniki zawsze trafiały
const toPascalEN = (role) => {
  const r = String(role || "").toLowerCase();
  if (r.includes("model")) return "Model";
  if (r.includes("photographer") || r.includes("fotograf"))
    return "Photographer";
  if (r.includes("designer") || r.includes("projektant")) return "Designer";
  if (r.includes("volunteer") || r.includes("wolontariusz")) return "Volunteer";
  return role || "";
};

const ModelDashboard = () => {
  const { currentUser } = useAuth();

  const [castings, setCastings] = useState([]);
  const [participantsByCasting, setParticipantsByCasting] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCasting, setSelectedCasting] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [userApplications, setUserApplications] = useState([]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("pl-PL") : "-");

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

  // Pobierz uczestników castingu → liczymy per rola (po EN PascalCase)
  const fetchParticipants = async (castingId) => {
    try {
      const data = await apiFetch(`/casting/casting/participants/${castingId}`);

      const counts = {};
      const p = data?.participants;

      // Obsłuż oba możliwe kształty odpowiedzi:
      // A) tablica obiektów z polem role/castingRole
      if (Array.isArray(p)) {
        for (const item of p) {
          const key = toPascalEN(item?.role ?? item?.castingRole);
          if (key) counts[key] = (counts[key] || 0) + 1;
        }
      }
      // B) obiekt { roleName: [ ...participants ] }
      else if (p && typeof p === "object") {
        for (const [roleKey, arr] of Object.entries(p)) {
          const key = toPascalEN(roleKey);
          counts[key] = Array.isArray(arr) ? arr.length : 0;
        }
      }

      setParticipantsByCasting((prev) => ({ ...prev, [castingId]: counts }));
    } catch (err) {
      console.error("Błąd pobierania uczestników castingu:", err);
    }
  };

  // POPRAWIONA LOGIKA - używamy podstawowego endpointu, który już ma role
  useEffect(() => {
    const fetchCastings = async () => {
      setLoading(true);
      try {
        // Podstawowy endpoint już ma role - nie trzeba dodatkowych wywołań
        const list = (await apiFetch("/casting/casting")) ?? [];
        console.log("Pobrane castingi z rolami:", list); // DEBUG

        // Ustaw castingi - role już są w odpowiedzi
        setCastings(list);

        // Pobierz liczniki uczestników dla każdego castingu
        const participantsPromises = list.map((c) => fetchParticipants(c.id));
        await Promise.all(participantsPromises);
      } catch (err) {
        console.error("Błąd pobierania castingów:", err);
        setError("Błąd pobierania castingów");
      } finally {
        setLoading(false);
      }
    };
    fetchCastings();
  }, []);

  // 2) Zgłoszenia użytkownika
  useEffect(() => {
    if (!currentUser) return;
    const fetchApplications = async () => {
      try {
        const data = await apiFetch(
          `/casting/casting/participant/${currentUser.id}`
        );
        setUserApplications(data || []);
      } catch (err) {
        console.error("Błąd pobierania zgłoszeń użytkownika:", err);
      }
    };
    fetchApplications();
  }, [currentUser]);

  // 3) Zgłoszenie do castingu
  const handleApply = async (castingId) => {
    try {
      await apiFetch(
        `/casting/casting/${castingId}/participant/${currentUser.id}`,
        {
          method: "POST",
        }
      );
      const data = await apiFetch(
        `/casting/casting/participant/${currentUser.id}`
      );
      setUserApplications(data || []);
      setSelectedCasting(null);
      setApplicationMessage("");
      alert("Zgłoszenie zostało wysłane!");
    } catch (err) {
      console.error("Błąd wysyłania zgłoszenia:", err);
      alert("Błąd wysyłania zgłoszenia");
    }
  };

  const hasApplied = (castingId) =>
    userApplications.some(
      (a) => a.id === castingId || a.castingId === castingId
    );

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
          {/* Moje zgłoszenia */}
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
                      const casting =
                        castings.find(
                          (c) =>
                            c.id === application.castingId ||
                            c.id === application.id
                        ) || {};
                      return (
                        <div
                          key={application.id}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <h3 className="font-medium text-gray-900 mb-2 text-sm">
                            {casting.title || "Casting"}
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

          {/* Dostępne castingi */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-[#2B2628]">
                  Dostępne castingi
                </h2>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  {castings.map((casting) => {
                    const counts = participantsByCasting[casting.id] || {};
                    console.log(`Casting ${casting.id} roles:`, casting.roles); // DEBUG
                    console.log(`Casting ${casting.id} counts:`, counts); // DEBUG

                    return (
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
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(casting.eventDate)}
                              </div>
                            </div>

                            {/* Role z licznikami - POPRAWIONA LOGIKA */}
                            <div className="flex flex-wrap gap-3 mb-3">
                              {!casting.roles ? (
                                <span className="text-gray-400 text-sm">
                                  Brak informacji o rolach
                                </span>
                              ) : !Array.isArray(casting.roles) ? (
                                <span className="text-gray-400 text-sm">
                                  Nieprawidłowe dane ról
                                </span>
                              ) : casting.roles.length === 0 ? (
                                <span className="text-gray-400 text-sm">
                                  Brak ról
                                </span>
                              ) : (
                                casting.roles.map((r, idx) => {
                                  // r.role zwykle: "Model" | "Photographer" | "Designer" | "Volunteer"
                                  const keyEN = toPascalEN(r.role);
                                  const label =
                                    ROLE_PL[r.role] ?? ROLE_PL[keyEN] ?? r.role;
                                  const taken =
                                    counts[keyEN] ?? counts[r.role] ?? 0;
                                  return (
                                    <span
                                      key={`${keyEN}-${idx}`}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                    >
                                      {label} {taken}/{r.capacity}
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>

                        {casting.description && (
                          <p className="text-gray-700 mb-4">
                            {casting.description}
                          </p>
                        )}

                        {Array.isArray(casting.tags) &&
                          casting.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {casting.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-[#EA1A62] bg-opacity-10 text-[#EA1A62] text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            Opublikowano: {formatDate(casting.createdAt)}
                          </p>
                          {hasApplied(casting.id) ? (
                            <Button variant="secondary" disabled>
                              Już się zgłosiłeś
                            </Button>
                          ) : (
                            <Button onClick={() => setSelectedCasting(casting)}>
                              Zgłoś się
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal zgłoszenia */}
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
