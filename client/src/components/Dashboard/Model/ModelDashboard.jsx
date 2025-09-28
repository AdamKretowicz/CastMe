import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
import Card from "../../UI/Card";
import Button from "../../UI/Button";
import ApplicationsList from "./ApplicationsList";
import CastingCard from "./CastingCard";
import Modal from "../../UI/Modal";
import { useCastingBanners } from "../../../hooks/useCastingBanners";

const sortByNewest = (arr) =>
  [...arr].sort((a, b) => {
    const ad = new Date(a?.createdAt || a?.eventDate || 0).getTime();
    const bd = new Date(b?.createdAt || b?.eventDate || 0).getTime();
    return bd - ad;
  });

export default function ModelDashboard() {
  const { currentUser } = useAuth();
  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCasting, setSelectedCasting] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [userApplications, setUserApplications] = useState([]);

  // bannery
  const { banners: castingBanners } = useCastingBanners(castings);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/casting/casting");
        setCastings(sortByNewest(Array.isArray(data) ? data : []));
      } catch (e) {
        setError("Błąd pobierania castingów");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const data = await apiFetch(
          `/casting/casting/participants/${currentUser.id}`
        );
        setUserApplications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Błąd pobierania zgłoszeń użytkownika:", e);
      }
    };
    load();
  }, [currentUser]);

  const hasApplied = (castingId) =>
    userApplications.some(
      (a) => a.id === castingId || a.castingId === castingId
    );

  const handleApply = async (castingId) => {
    try {
      await apiFetch(
        `/casting/casting/${castingId}/participants/${currentUser.id}`,
        { method: "POST" }
      );
      const data = await apiFetch(
        `/casting/casting/participants/${currentUser.id}`
      );
      setUserApplications(Array.isArray(data) ? data : []);
      setSelectedCasting(null);
      setApplicationMessage("");
      alert("Zgłoszenie zostało wysłane!");
    } catch (err) {
      alert("Błąd wysyłania zgłoszenia");
      console.error("Błąd wysyłania zgłoszenia:", err);
    }
  };

  const header = useMemo(
    () => (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
          Witaj, {currentUser.firstName}!
        </h1>
        <p className="text-gray-600">
          Zarządzaj swoimi zgłoszeniami i znajdź nowe okazje
        </p>
      </div>
    ),
    [currentUser?.firstName]
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie castingów...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {header}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Moje zgłoszenia */}
          <div className="lg:col-span-1">
            <ApplicationsList
              applications={userApplications}
              castings={castings}
            />
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
                  {castings.map((casting) => (
                    <CastingCard
                      key={casting.id}
                      casting={casting}
                      bannerUrl={castingBanners[casting.id]}
                      hasApplied={hasApplied(casting.id)}
                      onApply={() => setSelectedCasting(casting)}
                    />
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL – rozmyte tło, focus-trap, portal */}
      <Modal
        isOpen={!!selectedCasting}
        backdropImage={
          selectedCasting ? castingBanners[selectedCasting.id] : ""
        }
        onClose={() => {
          setSelectedCasting(null);
          setApplicationMessage("");
        }}
      >
        {selectedCasting && (
          <>
            <h3
              id="apply-modal-title"
              className="text-lg font-semibold text-[#2B2628] mb-4 px-6 pt-6"
            >
              Zgłoś się do: {selectedCasting.title}
            </h3>
            <div className="px-6">
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
            <div className="flex space-x-3 px-6 pb-6 pt-4">
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
          </>
        )}
      </Modal>
    </div>
  );
}
