// src/components/Casting/Organizer/OrganizerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCasting } from "../../../context/CastingContext";
import Button from "../../UI/Button";
import { Plus, MapPin, User, ArrowUp } from "lucide-react";
import {
  fetchFavoriteUsers,
  fetchUserProfile,
  getPhotoUrl,
} from "../../../utils/api";
import { useCastingBanners } from "../../../hooks/useCastingBanners";

import CreateCastingForm from "./CreateCastingForm";
import OrganizerCastingList from "./OrganizerCastingList";
// Usunięty ApplicationsPanel (całkowicie)
import ParticipantsModal from "./ParticipantsModal";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { currentUser, accessToken } = useAuth();

  const {
    castings,
    createCasting,
    isLoading,
    fetchCastings,
    refreshCastings,
    reloadCastings,
  } = useCasting();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState(null);

  // Modal uczestników (mechanika zostaje – prawy panel nie pokazuje już zgłoszeń)
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

  const refetchCastings =
    fetchCastings || refreshCastings || reloadCastings || null;

  // Nagłówek
  const header = useMemo(
    () => (
      <div className="mb-0">
        <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
          Dashboard Organizatora
        </h1>
        <p className="text-gray-600">
          Zarządzaj swoimi castingami i zgłoszeniami
        </p>
      </div>
    ),
    []
  );

  // Castingi organizatora
  const organizerCastings = useMemo(() => {
    const all = Array.isArray(castings) ? castings : [];
    const mine = currentUser?.id
      ? all.filter((c) => c?.organizerId === currentUser.id)
      : all;
    const arr = [...mine];
    arr.sort((a, b) => {
      const ad = new Date(a?.createdAt || a?.eventDate || 0).getTime();
      const bd = new Date(b?.createdAt || b?.eventDate || 0).getTime();
      return bd - ad;
    });
    return arr;
  }, [castings, currentUser?.id]);

  // Aktualizacja zaznaczonego castingu po refetchu
  useEffect(() => {
    if (!selectedCasting?.id) return;
    const updated = organizerCastings.find((c) => c.id === selectedCasting.id);
    if (updated) setSelectedCasting(updated);
  }, [organizerCastings, selectedCasting?.id]);

  // Bannery
  const { banners: castingBanners, fetchBannerFor } =
    useCastingBanners(organizerCastings);

  // Klik w kartę castingu => otwórz modal uczestników
  const openParticipantsModal = (casting) => {
    setSelectedCasting(casting);
    setParticipantsModalOpen(true);
  };

  // ======================
  // ULUBIENI UŻYTKOWNICY
  // ======================
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState(null);
  const [profilesCache, setProfilesCache] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!accessToken) return;
      setFavLoading(true);
      setFavError(null);
      try {
        const favs = await fetchFavoriteUsers(accessToken);
        if (!alive) return;
        const list = Array.isArray(favs) ? favs : [];
        setFavorites(list);
        list.forEach((u) => loadUserProfile(u.id));
      } catch (e) {
        if (!alive) return;
        setFavError(
          e?.message || "Nie udało się pobrać ulubionych użytkowników"
        );
      } finally {
        if (alive) setFavLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const loadUserProfile = async (userId) => {
    if (!userId || profilesCache[userId] || loadingProfiles.has(userId)) return;
    setLoadingProfiles((prev) => new Set(prev).add(userId));
    try {
      const prof = await fetchUserProfile(userId);
      setProfilesCache((prev) => ({ ...prev, [userId]: prof || null }));
    } catch {
      setProfilesCache((prev) => ({ ...prev, [userId]: null }));
    } finally {
      setLoadingProfiles((prev) => {
        const ns = new Set(prev);
        ns.delete(userId);
        return ns;
      });
    }
  };

  const handleOpenProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  // Kompaktowy wiersz z małym okrągłym avatarem
  const FavoriteRow = ({ user }) => {
    const profile = profilesCache[user.id];
    const isLoadingProfile = loadingProfiles.has(user.id);

    // Wybór zdjęcia
    const mainPhoto =
      profile?.photos?.find((p) => p.isMain) || profile?.photos?.[0] || null;
    const avatarSrc = mainPhoto?.url ? getPhotoUrl(mainPhoto.url) : null;

    // Lokalizacja
    const location =
      (profile?.city && profile?.country
        ? `${profile.city}, ${profile.country}`
        : profile?.city || profile?.country) || null;

    return (
      <div className="flex items-center gap-3 py-2">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => handleOpenProfile(user.id)}
          title="Zobacz profil"
        >
          {isLoadingProfile ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#EA1A62]" />
          ) : avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <User className="w-6 h-6 text-gray-500" />
          )}
        </div>

        {/* Teksty */}
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => handleOpenProfile(user.id)}
            className="block text-left font-medium text-sm text-[#2B2628] hover:text-[#EA1A62] truncate"
            title={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
          >
            {isLoadingProfile
              ? "Ładowanie…"
              : `${profile?.firstName ?? "—"} ${profile?.lastName ?? ""}`}
          </button>
          <div className="flex items-center text-xs text-gray-600 truncate">
            {location && (
              <>
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ======================
  // STRZAŁKA „DO GÓRY” po 20% scrolla
  // ======================
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const threshold = scrollable * 0.2; // 20% strony
      const current = window.scrollY || doc.scrollTop;
      setShowBackToTop(current > threshold);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // inicjalne ustawienie
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ======================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          {header}
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nowy casting
          </Button>
        </div>

        {showCreateForm && (
          <CreateCastingForm
            onClose={() => setShowCreateForm(false)}
            onCreated={() => setShowCreateForm(false)}
            createCasting={createCasting}
            onBannerUploaded={(id) => fetchBannerFor(id)}
          />
        )}

        {/* 3/4 : 1/4 układ */}
        <div className="grid grid-cols-4 gap-8">
          {/* Lewy panel: lista castingów (3/4) */}
          <div className="col-span-4 lg:col-span-3">
            <OrganizerCastingList
              castings={organizerCastings}
              castingBanners={castingBanners}
              isLoading={isLoading}
              selectedCastingId={selectedCasting?.id}
              onSelectCasting={(c) => {
                setSelectedCasting(c);
                openParticipantsModal(c);
              }}
              onAfterDelete={() => refetchCastings?.()}
            />
          </div>

          {/* Prawy panel: ulubieni użytkownicy (1/4) — zawsze zamiast zgłoszeń */}
          <div className="col-span-4 lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Ulubieni użytkownicy</h2>
                <p className="text-sm text-gray-600">
                  Szybki dostęp do zapisanych profili.
                </p>
              </div>

              {favError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3">
                  {favError}
                </div>
              )}

              {favLoading ? (
                <div className="py-6 text-center text-gray-500 text-sm">
                  Ładowanie listy ulubionych…
                </div>
              ) : favorites.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-sm">
                  Brak ulubionych użytkowników.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {favorites.map((u) => (
                    <FavoriteRow key={u.id} user={u} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pływający przycisk „do góry” */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Przewiń na górę"
          className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg bg-[#EA1A62] text-white hover:bg-[#d1185a] transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Modal uczestników (zachowany) */}
      <ParticipantsModal
        casting={selectedCasting}
        isOpen={participantsModalOpen}
        onClose={() => setParticipantsModalOpen(false)}
        onChanged={() => {
          refetchCastings?.();
        }}
      />
    </div>
  );
}
