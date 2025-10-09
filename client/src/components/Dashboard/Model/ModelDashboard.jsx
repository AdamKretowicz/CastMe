// src/components/Casting/Model/ModelDashboard.jsx
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

// PL nazwy ról do UI (używane też w komunikacie „Casting nie przewiduje roli…”)
const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
};

export default function ModelDashboard() {
  const { currentUser } = useAuth();

  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCasting, setSelectedCasting] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");

  // participations z /casting/casting/participations/{userId}
  const [userParticipations, setUserParticipations] = useState([]);
  const [participationsByCastingId, setParticipationsByCastingId] = useState(
    new Map()
  );
  const [loadingParticipations, setLoadingParticipations] = useState(false);

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

  // 2) Pobierz participations
  const refreshParticipations = async (userId) => {
    if (!userId) return;
    setLoadingParticipations(true);
    try {
      const res = await apiFetch(`/casting/casting/participations/${userId}`, {
        method: "GET",
      });
      const list = Array.isArray(res) ? res : [];
      setUserParticipations(list);

      const map = new Map();
      for (const row of list) {
        if (!row?.castingId) continue;
        map.set(normId(row.castingId), {
          status: row.assignmentStatus, // "Pending" | "Active" | "Rejected"
          role: row.role || "",
          assignmentId: row.assignmentId || null,
        });
      }
      setParticipationsByCastingId(map);
    } catch (e) {
      console.warn("Nie udało się pobrać moich zgłoszeń (participations):", e);
      setUserParticipations([]);
      setParticipationsByCastingId(new Map());
    } finally {
      setLoadingParticipations(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      refreshParticipations(currentUser.id);
    }
  }, [currentUser?.id]);

  const hasApplied = (castingId) =>
    participationsByCastingId.has(normId(castingId));
  const getApplied = (castingId) =>
    participationsByCastingId.get(normId(castingId)) || null;

  // 3) POST – dołącz do castingu
  const handleApply = async (castingId) => {
    if (!currentUser?.id) {
      alert("Musisz być zalogowany, aby się zgłosić.");
      return;
    }
    if (hasApplied(castingId)) {
      return;
    }

    try {
      await apiFetch(
        `/casting/casting/${castingId}/participant/${currentUser.id}`,
        {
          method: "POST",
        }
      );

      // optymistycznie pokaż Pending
      setParticipationsByCastingId((prev) => {
        const next = new Map(prev);
        next.set(normId(castingId), {
          status: "Pending",
          role: "",
          assignmentId: null,
        });
        return next;
      });

      // dociągnij świeże dane
      refreshParticipations(currentUser.id);

      setSelectedCasting(null);
      setApplicationMessage("");
      alert("Zgłoszenie zostało wysłane!");
    } catch (err) {
      console.error("Błąd wysyłania zgłoszenia:", err);

      if (err?.status === 409 || err?.status === 500) {
        setParticipationsByCastingId((prev) => {
          const next = new Map(prev);
          next.set(normId(castingId), {
            status: "Pending",
            role: "",
            assignmentId: null,
          });
          return next;
        });
        setSelectedCasting(null);
        setApplicationMessage("");
        alert("Już jesteś zgłoszony do tego castingu.");
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

  // pomocniczo wyciągamy rolę bieżącego usera (tylko do komunikatu; NIE blokujemy globalnie)
  const currentUserRoleName =
    currentUser?.role ||
    currentUser?.roleName ||
    currentUser?.userRole?.name ||
    currentUser?.userRole ||
    null;

  const header = useMemo(
    () => (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
          Witaj{currentUser?.firstName ? `, ${currentUser.firstName}` : ""}!
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
              applications={userParticipations}
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
                    const afterDeadline =
                      casting.eventDate &&
                      new Date(casting.eventDate) < new Date();

                    const applied = getApplied(casting.id);
                    const userHasApplied = !!applied;
                    const appliedStatus = applied?.status || null;
                    const appliedRole = applied?.role || null;

                    // Czy casting przewiduje MOJĄ rolę? (komunikat informacyjny)
                    const myRole = currentUserRoleName || "";
                    const myRolePL = myRole
                      ? roleDisplayMap[myRole] || myRole
                      : "";
                    const roleExists = Array.isArray(casting.roles)
                      ? casting.roles.some(
                          (r) =>
                            String(r.role).toLowerCase() ===
                            String(myRole).toLowerCase()
                        )
                      : false;

                    const blockedReason =
                      !userHasApplied && myRole && !roleExists
                        ? `Casting nie przewiduje roli „${myRolePL}”.`
                        : null;

                    // Button jest wyłączony na zamknięte/po terminie/już zgłoszony/ładowanie
                    const disabledComputed =
                      isClosed ||
                      afterDeadline ||
                      userHasApplied ||
                      loadingParticipations;

                    return (
                      <CastingCard
                        key={casting.id}
                        casting={casting}
                        bannerUrl={castingBanners[casting.id]}
                        hasApplied={userHasApplied}
                        appliedStatus={appliedStatus}
                        appliedRole={appliedRole}
                        disabled={disabledComputed}
                        blockedReason={blockedReason} // ⬅ komunikat PL
                        onApply={() => {
                          if (disabledComputed || blockedReason) return;
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

      {/* MODAL APLIKACJI */}
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
