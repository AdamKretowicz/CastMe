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

const normId = (v) => (v == null ? "" : String(v).toLowerCase());

// „tolerancyjny” parser: wyciągnij castingId z odpowiedzi GET /casting/casting/participant/{userId}
// Obsługujemy kilka możliwych kształtów: tablica obiektów { castingId } / { id } / { casting: { id } }
// lub obiekt { castingIds: [...] }
const extractCastingIdsForUser = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) {
    return res
      .map((x) => x?.castingId ?? x?.id ?? x?.casting?.id)
      .filter(Boolean)
      .map(String);
  }
  if (Array.isArray(res?.items)) {
    return res.items
      .map((x) => x?.castingId ?? x?.id ?? x?.casting?.id)
      .filter(Boolean)
      .map(String);
  }
  if (Array.isArray(res?.castingIds)) {
    return res.castingIds.filter(Boolean).map(String);
  }
  return [];
};

export default function ModelDashboard() {
  const { currentUser } = useAuth();

  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCasting, setSelectedCasting] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");

  // „moje zgłoszenia” — surowe dane (dla ApplicationsList)
  const [userApplications, setUserApplications] = useState([]);

  // Zestaw castingów, do których user dołączył (dla szybkiego hasApplied)
  const [userCastingIds, setUserCastingIds] = useState(new Set());
  const [loadingUserCastingIds, setLoadingUserCastingIds] = useState(false);

  // bannery
  const { banners: castingBanners } = useCastingBanners(castings);

  // 1) Pobierz listę castingów
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/casting/casting");
        setCastings(sortByNewest(Array.isArray(data) ? data : []));
      } catch (e) {
        console.error(e);
        setError("Błąd pobierania castingów");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 2) Pobierz „moje zgłoszenia” po userId — KLUCZOWE
  const refreshUserParticipations = async (userId) => {
    if (!userId) return;
    setLoadingUserCastingIds(true);
    try {
      const res = await apiFetch(`/casting/casting/participant/${userId}`, {
        method: "GET",
      });
      // a) zasil listę ApplicationsList (jeśli chcesz ją pokazywać)
      setUserApplications(
        Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []
      );

      // b) ustaw Set castingId dla hasApplied
      const ids = extractCastingIdsForUser(res);
      setUserCastingIds(new Set(ids.map(normId)));
    } catch (e) {
      // Jeśli 403/404 – zwykle znaczy brak dostępu/zgłoszeń; wtedy zostaw pusty set
      console.warn("Nie udało się pobrać moich zgłoszeń:", e);
      setUserApplications([]);
      setUserCastingIds(new Set());
    } finally {
      setLoadingUserCastingIds(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      refreshUserParticipations(currentUser.id);
    }
  }, [currentUser?.id]);

  const hasApplied = (castingId) => userCastingIds.has(normId(castingId));

  // 3) POST – dołącz do castingu: optymistycznie + odśwież „moje zgłoszenia”
  const handleApply = async (castingId) => {
    if (!currentUser?.id) {
      alert("Musisz być zalogowany, aby się zgłosić.");
      return;
    }
    if (hasApplied(castingId)) {
      alert("Już dołączyłeś do tego castingu.");
      return;
    }

    try {
      await apiFetch(
        `/casting/casting/${castingId}/participant/${currentUser.id}`,
        { method: "POST" }
      );

      // OPTYMISTYCZNIE: dopisz do setu, żeby UI od razu był poprawny
      setUserCastingIds((prev) => {
        const next = new Set(prev);
        next.add(normId(castingId));
        return next;
      });

      // A-SYNC: dociągnij najnowszy stan z backendu
      refreshUserParticipations(currentUser.id);

      setSelectedCasting(null);
      setApplicationMessage("");
      alert("Zgłoszenie zostało wysłane!");
    } catch (err) {
      console.error("Błąd wysyłania zgłoszenia:", err);

      // Jeśli backend zwróci 409/500 dla duplikatu — zaznacz mimo wszystko
      if (err?.status === 409 || err?.status === 500) {
        setUserCastingIds((prev) => {
          const next = new Set(prev);
          next.add(normId(castingId));
          return next;
        });
        setSelectedCasting(null);
        setApplicationMessage("");
        alert("Już jesteś uczestnikiem tego castingu.");
        return;
      }

      const msg =
        err?.status === 403
          ? "Nie możesz dołączyć do tego castingu."
          : err?.status === 404
          ? "Casting nie istnieje."
          : "Błąd wysyłania zgłoszenia.";
      alert(msg);
    }
  };

  const header = useMemo(
    () => (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
          Witaj, {currentUser?.firstName || "Modelu"}!
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
                  {castings.map((casting) => {
                    const isClosed =
                      casting.status && casting.status !== "Active";
                    const isFull = casting.roles?.some(
                      (r) => r.capacity && r.acceptedCount >= r.capacity
                    );
                    const afterDeadline =
                      casting.eventDate &&
                      new Date(casting.eventDate) < new Date();

                    const disabledComputed =
                      isClosed ||
                      isFull ||
                      afterDeadline ||
                      hasApplied(casting.id);

                    return (
                      <CastingCard
                        key={casting.id}
                        casting={casting}
                        bannerUrl={castingBanners[casting.id]}
                        hasApplied={hasApplied(casting.id)}
                        disabled={disabledComputed}
                        onApply={() => {
                          // nie otwieraj modala, jeśli jeszcze ładujemy lub jest disabled
                          if (loadingUserCastingIds || disabledComputed) return;
                          setSelectedCasting(casting);
                        }}
                      />
                    );
                  })}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL */}
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
