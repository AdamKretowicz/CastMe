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
import { useToast } from "../../../context/ToastProvider";

const sortByEventDate = (arr) => {
  const now = Date.now();
  return [...arr].sort((a, b) => {
    const ta = new Date(a?.eventDate || 0).getTime();
    const tb = new Date(b?.eventDate || 0).getTime();

    const aFuture = ta >= now;
    const bFuture = tb >= now;

    // najpierw przyszłe
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;

    // wśród przyszłych: najbliższe -> najdalsze (rosnąco)
    if (aFuture && bFuture) return ta - tb;

    // wśród przeszłych: najświeższe -> najstarsze (malejąco)
    return tb - ta;
  });
};

const normId = (v) => (v == null ? "" : String(v).toLowerCase());

// PL nazwy ról do UI (używane też w komunikacie „Casting nie przewiduje roli…”)
const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
};

// util: zapewnij minimalny czas trwania (np. 1000 ms)
const withMinDelay = async (promise, ms = 1000) => {
  const [res] = await Promise.all([
    promise,
    new Promise((r) => setTimeout(r, ms)),
  ]);
  return res;
};

export default function ModelDashboard() {
  const { currentUser } = useAuth();
  const { show } = useToast();

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

  // ID castingu, który właśnie wysyłamy (loading submit)
  const [applyingId, setApplyingId] = useState(null);

  // bannery
  const { banners: castingBanners } = useCastingBanners(castings);

  // 1) Pobierz listę castingów
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/casting/casting");
        setCastings(sortByEventDate(Array.isArray(data) ? data : []));
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

  // 3) POST – dołącz do castingu (z loadingiem i 1s min delay)
  const handleApply = async (castingId) => {
    if (!currentUser?.id) {
      show("Musisz być zalogowany, aby się zgłosić.", "error");
      return;
    }
    if (hasApplied(castingId) || applyingId) {
      return;
    }

    try {
      setApplyingId(castingId);

      await withMinDelay(
        apiFetch(
          `/casting/casting/${castingId}/participant/${currentUser.id}`,
          { method: "POST" }
        ),
        1000
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
      show("Zgłoszenie zostało wysłane!", "success");
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
        show("Już jesteś zgłoszony do tego castingu.", "info");
      } else {
        const msg =
          err?.status === 403
            ? "Nie możesz dołączyć do tego castingu."
            : err?.status === 404
            ? "Casting nie istnieje."
            : "Błąd wysyłania zgłoszenia.";
        show(msg, "error");
      }
    } finally {
      setApplyingId(null);
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
                      loadingParticipations ||
                      applyingId === casting.id;

                    return (
                      <CastingCard
                        key={casting.id}
                        casting={casting}
                        bannerUrl={castingBanners[casting.id]}
                        hasApplied={userHasApplied}
                        appliedStatus={appliedStatus}
                        appliedRole={appliedRole}
                        disabled={disabledComputed}
                        blockedReason={blockedReason}
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
          if (applyingId) return; // w trakcie wysyłki nie zamykamy
          setSelectedCasting(null);
          setApplicationMessage("");
        }}
      >
        {selectedCasting && (
          <div className="relative">
            {" "}
            {/* <-- kontener do overlay */}
            {/* OVERLAY LOADING podczas wysyłki */}
            {applyingId && (
              <div
                className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20"
                aria-busy="true"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-block h-8 w-8 rounded-full border-4 border-[#EA1A62] border-t-transparent animate-spin" />
                  <span className="text-[#2B2628] font-medium">
                    Wysyłanie zgłoszenia…
                  </span>
                </div>
              </div>
            )}
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
                disabled={!!applyingId}
              />
            </div>
            <div className="flex space-x-3 px-6 pb-6 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                type="button"
                disabled={!!applyingId}
                onClick={() => {
                  setSelectedCasting(null);
                  setApplicationMessage("");
                }}
              >
                Anuluj
              </Button>
              <Button
                className="flex-1 inline-flex items-center justify-center gap-2"
                type="button"
                disabled={!!applyingId}
                onClick={() => handleApply(selectedCasting.id)}
              >
                {applyingId ? (
                  <>
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Wysyłanie…
                  </>
                ) : (
                  "Wyślij zgłoszenie"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
