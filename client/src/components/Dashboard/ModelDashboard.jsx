import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ImageOff,
} from "lucide-react";
import Card from "../UI/Card";
import Button from "../UI/Button";

/* =========================
 * Mapowania ról (bez zmian)
 * ========================= */
const roleEnumMap = {
  0: "Model",
  1: "Photographer",
  2: "Designer",
  3: "Volunteer",
};

const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
  0: "Model",
  1: "Fotograf",
  2: "Projektant",
  3: "Wolontariusz",
};

const getRoleDisplayName = (role) => {
  if (typeof role === "number") {
    const englishName = roleEnumMap[role];
    return (
      roleDisplayMap[englishName] || roleDisplayMap[role] || `Rola ${role}`
    );
  }
  return roleDisplayMap[role] || role;
};

/* =========================
 * Narzędzia do bannerów
 * ========================= */
const BANNERS_STORAGE_KEY = "castingBannerUrls"; // współdzielony cache z OrganizerDashboard

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof window !== "undefined" ? window.location.origin : "");

const toAbsoluteUrl = (u) => {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

const readBannerCache = () => {
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeBannerCache = (obj) => {
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(obj));
  } catch {}
};

/** Komponent bannera: 16:9, obraz "contain" + rozmyte tło wypełniające */
const BannerImage = ({ src, alt = "", className = "" }) => {
  if (!src) {
    return (
      <div
        className={`relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400 text-sm">Brak bannera</span>
      </div>
    );
  }
  return (
    <div
      className={`relative w-full aspect-[16/9] rounded-lg overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${src})`,
          filter: "blur(16px)",
          transform: "scale(1.1)",
          opacity: 0.45,
        }}
      />
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

/** Placeholder gdy brak obrazka lub błąd */
const BannerPlaceholder = ({ text = "Casting bez bannera" }) => (
  <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center">
    <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
    <span className="text-gray-500 text-sm">{text}</span>
  </div>
);

const ModelDashboard = () => {
  const { currentUser } = useAuth();

  const [castings, setCastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCasting, setSelectedCasting] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [userApplications, setUserApplications] = useState([]);

  /** Cache URL-i bannerów: { [castingId]: string|null|undefined } */
  const [castingBanners, setCastingBanners] = useState({});

  /** Refs + focus-trap dla modala */
  const modalRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  /* =========================
   * Pobieranie castingów (z sortowaniem od najnowszych)
   * ========================= */
  useEffect(() => {
    const fetchCastings = async () => {
      try {
        const data = await apiFetch("/casting/casting");
        const sorted = (Array.isArray(data) ? [...data] : []).sort((a, b) => {
          const ad = new Date(a?.createdAt || a?.eventDate || 0).getTime();
          const bd = new Date(b?.createdAt || b?.eventDate || 0).getTime();
          return bd - ad; // najnowsze najpierw
        });
        setCastings(sorted);
      } catch (err) {
        setError("Błąd pobierania castingów");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCastings();
  }, []);

  /* =========================
   * Pobieranie zgłoszeń użytkownika
   * ========================= */
  useEffect(() => {
    if (!currentUser) return;
    const fetchApplications = async () => {
      try {
        const data = await apiFetch(
          `/casting/casting/participants/${currentUser.id}`
        );
        setUserApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Błąd pobierania zgłoszeń użytkownika:", err);
      }
    };
    fetchApplications();
  }, [currentUser]);

  /* =========================
   * Cache bannerów (start + zapis)
   * ========================= */
  useEffect(() => {
    setCastingBanners((prev) => ({ ...readBannerCache(), ...prev }));
  }, []);

  useEffect(() => {
    writeBannerCache(castingBanners);
  }, [castingBanners]);

  /* =========================
   * Pobieranie banneru pojedynczego castingu
   * ========================= */
  const fetchBannerFor = useCallback(async (castingId) => {
    if (!castingId) return;
    try {
      const res = await apiFetch(`/casting/casting/${castingId}/banner`, {
        method: "GET",
      });
      const absUrl = toAbsoluteUrl(res?.url);
      setCastingBanners((prev) => {
        const next = { ...prev, [castingId]: absUrl || null };
        writeBannerCache(next);
        return next;
      });
    } catch (err) {
      setCastingBanners((prev) => {
        const next = { ...prev, [castingId]: null };
        writeBannerCache(next);
        return next;
      });
      if (err?.status !== 404) {
        console.error("Banner fetch error for", castingId, err);
      }
    }
  }, []);

  /* =========================
   * Po pobraniu listy — dociągnij brakujące bannery
   * ========================= */
  useEffect(() => {
    if (!castings?.length) return;

    // jeżeli backend zwraca inline url — skorzystaj
    setCastingBanners((prev) => {
      const next = { ...prev };
      castings.forEach((c) => {
        const inlineUrl =
          c.bannerUrl || c.banner?.url || c.bannerPath || c.banner;
        if (inlineUrl && next[c.id] == null) {
          next[c.id] = toAbsoluteUrl(inlineUrl);
        }
      });
      return next;
    });

    const missingIds = castings
      .map((c) => c.id)
      .filter((id) => id && typeof castingBanners[id] === "undefined");

    if (missingIds.length > 0) {
      Promise.allSettled(missingIds.map((id) => fetchBannerFor(id))).catch(
        () => {}
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castings, fetchBannerFor]);

  /* =========================
   * Focus trap + scroll lock (prosto i niezawodnie)
   * ========================= */
  useEffect(() => {
    if (!selectedCasting) return;

    // zapamiętaj poprzedni fokus i zablokuj scroll
    previouslyFocusedRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // po wyrenderowaniu ustaw focus na pierwszym fokusowalnym
    const id = requestAnimationFrame(() => {
      if (!modalRef.current) return;
      const focusables = getFocusable(modalRef.current);
      if (focusables.length) focusables[0].focus();
      else modalRef.current.focus();
    });

    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = originalOverflow || "";
      if (previouslyFocusedRef.current && previouslyFocusedRef.current.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [selectedCasting]);

  /* =========================
   * Helpery a11y/keyboard
   * ========================= */
  function getFocusable(root) {
    if (!root) return [];
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    return Array.from(root.querySelectorAll(selector)).filter(
      (el) => el.offsetParent !== null || el.getClientRects().length
    );
  }

  const handleModalKeyDown = (e) => {
    if (e.key === "Tab") {
      const focusables = getFocusable(modalRef.current);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === "Escape") {
      setSelectedCasting(null);
      setApplicationMessage("");
    }
  };

  /* =========================
   * Akcje
   * ========================= */
  const formatDate = (date) => new Date(date).toLocaleDateString("pl-PL");

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

  const handleApply = async (castingId) => {
    try {
      await apiFetch(
        `/casting/casting/${castingId}/participants/${currentUser.id}`,
        {
          method: "POST",
        }
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

  const hasApplied = (castingId) =>
    userApplications.some(
      (app) => app.id === castingId || app.castingId === castingId
    );

  /* =========================
   * Render
   * ========================= */
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
                    <div
                      key={casting.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      {/* Banner (jak w OrganizerDashboard) */}
                      <div className="w-full mb-3">
                        {typeof castingBanners[casting.id] === "string" &&
                        castingBanners[casting.id] ? (
                          <BannerImage
                            src={castingBanners[casting.id]}
                            alt={`Banner castingu ${casting.title}`}
                            className="rounded-lg"
                          />
                        ) : (
                          <BannerPlaceholder />
                        )}
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
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

                          {casting.roles && casting.roles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {casting.roles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {getRoleDisplayName(role.role)}{" "}
                                  {role.acceptedCount || 0}/{role.capacity}
                                </span>
                              ))}
                            </div>
                          )}

                          {casting.compensation && (
                            <div className="text-sm font-medium text-[#EA1A62] mb-3">
                              Wynagrodzenie: {casting.compensation}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">
                        {casting.description}
                      </p>

                      {casting.tags && casting.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {casting.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-[#EA1A62] bg-opacity-10 text-[#FFFFFF] text-xs rounded-full"
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
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal zgłoszenia – przez portal + pełny overlay, rozmyte tło, focus trap */}
      {selectedCasting &&
        createPortal(
          (() => {
            const bannerUrl = castingBanners?.[selectedCasting.id] || "";
            return (
              <div
                className="fixed inset-0 z-50"
                // overlay łapie kliknięcia, żeby nic nie „przebijało”
                onMouseDown={(e) => {
                  // klik w overlay nie zamyka sam z siebie; tylko blokuje tło
                  // jeśli chcesz: setSelectedCasting(null);
                  e.stopPropagation();
                }}
              >
                {/* Warstwa tła (rozmyty banner + przyciemnienie) */}
                <div className="absolute inset-0">
                  {bannerUrl && (
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-center bg-cover"
                      style={{
                        backgroundImage: `url(${bannerUrl})`,
                        filter: "blur(22px)",
                        transform: "scale(1.12)",
                        opacity: 0.5,
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                </div>

                {/* Kontener centrowany */}
                <div className="relative min-h-full flex items-center justify-center p-4">
                  <div
                    ref={modalRef}
                    className="bg-white rounded-2xl w-full max-w-md shadow-xl ring-1 ring-black/5 outline-none"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="apply-modal-title"
                    onKeyDown={handleModalKeyDown}
                    tabIndex={-1}
                    // klik w panel nie bąbelkuje do overlay
                    onMouseDown={(e) => e.stopPropagation()}
                  >
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
                  </div>
                </div>
              </div>
            );
          })(),
          document.body
        )}
    </div>
  );
};

export default ModelDashboard;
