import { useState, useMemo, useEffect, useCallback } from "react";
import { useCasting } from "../../context/CastingContext";
import {
  Plus,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Calendar,
  ImageOff,
} from "lucide-react";
import Card from "../UI/Card";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { apiFetch } from "../../utils/api";

const ALL_ROLES = ["Model", "Fotograf", "Projektant", "Wolontariusz"];

// UI (PL) -> API (EN)
const roleMap = {
  Model: "Model",
  Fotograf: "Photographer",
  Projektant: "Designer",
  Wolontariusz: "Volunteer",
};

// API (EN) -> UI (PL)
const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
};

/** Absolutny URL do pliku (Swagger zwraca np. "/uploads/...") */
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof window !== "undefined" ? window.location.origin : "");
const toAbsoluteUrl = (u) => {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};
const bust = (url) =>
  !url ? "" : `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

/** Trwały cache w localStorage — żeby bannery nie znikały po przeładowaniu */
const BANNERS_STORAGE_KEY = "castingBannerUrls";

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

/** Komponent bannera: pełne pole (16:9), właściwy obraz bez zniekształceń (object-contain),
 *  a puste przestrzenie wypełnia rozmyte tło z tego samego obrazka.
 */
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
      {/* Rozmyte tło wypełniające pole */}
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
      {/* Właściwy obraz – zawsze cały, bez przycięcia i zniekształceń */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

/** Placeholder używany na kartach, gdy brak obrazka lub błąd */
const BannerPlaceholder = ({ text = "Casting bez bannera" }) => (
  <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center">
    <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
    <span className="text-gray-500 text-sm">{text}</span>
  </div>
);

const OrganizerDashboard = () => {
  const { castings, createCasting, getCastingApplications, isLoading } =
    useCasting();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState(null);

  /** cache URL-i bannerów: { [castingId]: string|null|undefined }
   *  undefined -> jeszcze nie próbowaliśmy pobrać
   *  null      -> banner nie istnieje (404) lub błąd pobierania
   *  string    -> absolutny URL do obrazka
   */
  const [castingBanners, setCastingBanners] = useState({});
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    compensation: "",
    tags: "",
    roles: [{ role: "Model", capacity: "" }],
    deadline: "",
    bannerFile: null,
  });

  const [showCompensation, setShowCompensation] = useState(false);
  const [errors, setErrors] = useState({});

  /** Stabilna lista castingów */
  const organizerCastings = useMemo(() => {
    const arr = Array.isArray(castings) ? [...castings] : [];
    // sort: createdAt DESC (fallback: eventDate DESC)
    arr.sort((a, b) => {
      const ad = new Date(a?.createdAt || a?.eventDate || 0).getTime();
      const bd = new Date(b?.createdAt || b?.eventDate || 0).getTime();
      return bd - ad;
    });
    return arr;
  }, [castings]);

  /** 1) Wczytaj cache bannerów z localStorage na starcie */
  useEffect(() => {
    setCastingBanners((prev) => ({ ...readBannerCache(), ...prev }));
  }, []);

  /** 2) Zapisuj cache przy każdej zmianie */
  useEffect(() => {
    writeBannerCache(castingBanners);
  }, [castingBanners]);

  /** 3) Helper: pobierz banner pojedynczego castingu i zapisz w cache */
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
      // Ustaw null przy 404 lub dowolnym błędzie – unikamy wiszącego "Ładowanie…"
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

  /** 4) Po otrzymaniu listy castingów dociągnij brakujące bannery */
  useEffect(() => {
    if (!organizerCastings?.length) return;

    // Prefill (na przyszłość, gdyby backend dodał pole w samym castingu)
    setCastingBanners((prev) => {
      const next = { ...prev };
      organizerCastings.forEach((c) => {
        const inlineUrl =
          c.bannerUrl || c.banner?.url || c.bannerPath || c.banner;
        if (inlineUrl && next[c.id] == null) {
          next[c.id] = toAbsoluteUrl(inlineUrl);
        }
      });
      return next;
    });

    // Dociągnij brakujące (undefined)
    const missingIds = organizerCastings
      .map((c) => c.id)
      .filter((id) => id && typeof castingBanners[id] === "undefined");

    if (missingIds.length > 0) {
      Promise.allSettled(missingIds.map((id) => fetchBannerFor(id))).catch(
        () => {}
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizerCastings, fetchBannerFor]);

  const selectedRoleNames = useMemo(
    () => formData.roles.map((r) => r.role).filter(Boolean),
    [formData.roles]
  );

  const availableExtraRoles = useMemo(
    () =>
      ALL_ROLES.filter((r) => r !== "Model" && !selectedRoleNames.includes(r)),
    [selectedRoleNames]
  );

  const validateForm = () => {
    const e = {};
    if (!formData.title) e.title = "Tytuł jest wymagany";
    else if (formData.title.length < 5 || formData.title.length > 100)
      e.title = "Tytuł musi mieć od 5 do 100 znaków";

    if (!formData.description) e.description = "Opis jest wymagany";
    else if (
      formData.description.length < 20 ||
      formData.description.length > 2000
    )
      e.description = "Opis musi mieć od 20 do 2000 znaków";

    if (!formData.location) e.location = "Lokalizacja jest wymagana";
    else if (formData.location.length < 2 || formData.location.length > 100)
      e.location = "Lokalizacja musi mieć od 2 do 100 znaków";

    if (!formData.deadline) e.deadline = "Termin jest wymagany";

    if (!formData.requirements) e.requirements = "Wymagania są wymagane";
    else if (formData.requirements.length > 1000)
      e.requirements = "Wymagania nie mogą przekraczać 1000 znaków";

    if (
      showCompensation &&
      formData.compensation &&
      formData.compensation.length > 100
    )
      e.compensation = "Wynagrodzenie nie może być dłuższe niż 100 znaków";

    formData.roles.forEach((r, i) => {
      if (!r.role) e[`role-${i}`] = "Wybierz rolę";
      else if (!r.capacity || isNaN(r.capacity) || Number(r.capacity) <= 0)
        e[`role-${i}`] = "Podaj poprawną liczbę miejsc";
    });

    if (formData.tags) {
      const tagList = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length > 5) e.tags = "Możesz dodać maksymalnie 5 tagów";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleRoleFieldChange = (index, field, value) => {
    setFormData((p) => {
      const roles = [...p.roles];
      roles[index] = { ...roles[index], [field]: value };
      return { ...p, roles };
    });
    if (errors[`role-${index}`])
      setErrors((p) => ({ ...p, [`role-${index}`]: "" }));
  };

  const addEmptyRoleRow = () => {
    setFormData((p) => {
      if (p.roles.length >= ALL_ROLES.length) return p;
      return { ...p, roles: [...p.roles, { role: "", capacity: "" }] };
    });
  };

  const removeRoleRow = (index) => {
    setFormData((p) => ({
      ...p,
      roles: p.roles.filter((_, i) => i !== index),
    }));
  };

  /** Upload bannera – POST /casting/casting/{castingId}/banner z polem `File` */
  const uploadCastingBanner = useCallback(async (castingId, file) => {
    try {
      const fd = new FormData();
      fd.append("File", file); // dokładnie tak jak w Swaggerze

      const res = await apiFetch(`/casting/casting/${castingId}/banner`, {
        method: "POST",
        body: fd,
      });

      const fileUrl = res?.url ? toAbsoluteUrl(res.url) : "";
      if (!fileUrl) return null;

      const busted = bust(fileUrl); // wymusza świeże pobranie
      setCastingBanners((prev) => {
        const next = { ...prev, [castingId]: busted };
        writeBannerCache(next);
        return next;
      });

      return busted;
    } catch (e) {
      console.error("Błąd uploadu bannera:", e);
      // (opcjonalnie) oznacz brak bannera, by nie wisiało "Ładowanie…"
      setCastingBanners((prev) => {
        const next = { ...prev, [castingId]: null };
        writeBannerCache(next);
        return next;
      });
      return null;
    }
  }, []);

  /** Tworzenie castingu + upload bannera */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const event = new Date(formData.deadline);
    event.setHours(12, 0, 0, 0);

    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      eventDate: event.toISOString(),
      requirements: formData.requirements,
      compensation: showCompensation ? formData.compensation : "",
      roles: formData.roles
        .filter((r) => r.role)
        .map((r) => ({
          role: roleMap[r.role],
          capacity: parseInt(r.capacity, 10),
        })),
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 5)
        : [],
    };

    try {
      const result = await createCasting(payload);
      if (!result?.success) {
        console.error("createCasting error:", result);
        alert("Błąd podczas tworzenia castingu");
        return;
      }

      const createdCasting = result?.casting ?? result?.data ?? result;
      const newId = createdCasting?.id;
      if (!newId) {
        console.error("Brak ID w odpowiedzi API:", result);
        alert("Casting utworzony, ale nie udało się odczytać jego ID.");
        return;
      }

      if (formData.bannerFile) {
        try {
          setIsUploadingBanner(true);
          await uploadCastingBanner(newId, formData.bannerFile);
        } catch (err) {
          console.error("Błąd uploadu bannera:", err);
          alert("Casting utworzony, ale nie udało się wgrać bannera.");
        } finally {
          setIsUploadingBanner(false);
        }
      }

      // Reset formularza
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        compensation: "",
        tags: "",
        roles: [{ role: "Model", capacity: "" }],
        deadline: "",
        bannerFile: null,
      });
      setShowCompensation(false);
      setShowCreateForm(false);
      alert("Casting został utworzony pomyślnie!");
    } catch (err) {
      console.error("Wyjątek przy tworzeniu castingu:", err);
      alert("Błąd podczas tworzenia castingu");
    }
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
        return null;
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    if (!selectedCasting) return;
    try {
      await apiFetch(
        `/casting/casting/${applicationId}/status?castingId=${selectedCasting.id}&status=${newStatus}`,
        { method: "GET" }
      );
      await getCastingApplications(selectedCasting.id);
      alert(
        newStatus === "accepted"
          ? "Zgłoszenie zaakceptowane"
          : "Zgłoszenie odrzucone"
      );
    } catch (err) {
      console.error("Błąd przy zmianie statusu:", err);
      alert("Nie udało się zmienić statusu zgłoszenia");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
              Dashboard Organizatora
            </h1>
            <p className="text-gray-600">
              Zarządzaj swoimi castingami i zgłoszeniami
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nowy casting
          </Button>
        </div>

        {/* FORMULARZ */}
        {showCreateForm && (
          <Card className="mb-8 relative">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="absolute top-3 right-3 z-10 bg-[#EA1A62] text-white rounded-full p-1.5 hover:bg-[#c7154f] focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
              aria-label="Zamknij formularz"
              title="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>

            <Card.Header>
              <h2 className="text-xl font-semibold text-[#2B2628]">
                Utwórz nowy casting
              </h2>
            </Card.Header>
            <Card.Content>
              <form
                onSubmit={handleSubmit}
                className="space-y-6 max-w-3xl mx-auto"
              >
                <Input
                  label="Tytuł"
                  name="title"
                  value={formData.title}
                  onChange={handleBasicChange}
                  error={errors.title}
                  required
                  placeholder="Sesja zdjęciowa dla marki odzieżowej"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleBasicChange}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    rows="4"
                    placeholder="Opisz szczegóły castingu..."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wymagania <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleBasicChange}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] ${
                      errors.requirements ? "border-red-300" : "border-gray-300"
                    }`}
                    rows="3"
                    placeholder="Napisz, jakie są wymagania wobec uczestników..."
                  />
                  {errors.requirements && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.requirements}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-7">
                    <Input
                      label="Lokalizacja"
                      name="location"
                      value={formData.location}
                      onChange={handleBasicChange}
                      error={errors.location}
                      required
                      placeholder="Warszawa"
                    />
                  </div>

                  <div className="md:col-span-5">
                    {!showCompensation ? (
                      <button
                        type="button"
                        onClick={() => setShowCompensation(true)}
                        className="inline-flex items-center text-[#EA1A62] hover:text-[#d01757] text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Dodaj wynagrodzenie
                      </button>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Wynagrodzenie (opcjonalnie)
                        </label>
                        <div className="grid grid-cols-12 items-center gap-3">
                          <div className="col-span-11">
                            <input
                              type="text"
                              name="compensation"
                              value={formData.compensation}
                              onChange={handleBasicChange}
                              placeholder="np. 500–800 PLN"
                              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] ${
                                errors.compensation
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setShowCompensation(false);
                                setFormData((p) => ({
                                  ...p,
                                  compensation: "",
                                }));
                              }}
                              className="self-center text-gray-400 hover:text-red-500"
                              title="Usuń wynagrodzenie"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        {errors.compensation && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.compensation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Poszukiwane role
                  </label>

                  {/* Model (stały) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mb-3">
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        value="Model"
                        disabled
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-700"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <input
                        type="number"
                        placeholder="Ilość"
                        value={formData.roles[0].capacity}
                        onChange={(e) =>
                          handleRoleFieldChange(0, "capacity", e.target.value)
                        }
                        className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] ${
                          errors["role-0"]
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {errors["role-0"] && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors["role-0"]}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-1" />
                  </div>

                  {/* Dodatkowe role */}
                  {formData.roles.slice(1).map((r, idx) => {
                    const i = idx + 1;
                    const options = ALL_ROLES.filter(
                      (role) =>
                        role !== "Model" &&
                        (!selectedRoleNames.includes(role) || role === r.role)
                    );

                    return (
                      <div
                        key={`role-row-${i}`}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mb-3"
                      >
                        <div className="md:col-span-6">
                          <select
                            value={r.role}
                            onChange={(e) =>
                              handleRoleFieldChange(i, "role", e.target.value)
                            }
                            className="block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] border-gray-300 bg-white"
                          >
                            <option value="" disabled>
                              Wybierz rolę
                            </option>
                            {options.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-5">
                          <input
                            type="number"
                            placeholder="Ilość"
                            value={r.capacity}
                            onChange={(e) =>
                              handleRoleFieldChange(
                                i,
                                "capacity",
                                e.target.value
                              )
                            }
                            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] ${
                              errors[`role-${i}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`role-${i}`] && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors[`role-${i}`]}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeRoleRow(i)}
                            className="text-gray-400 hover:text-red-500 text-lg"
                            title="Usuń rolę"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {formData.roles.length < ALL_ROLES.length &&
                    availableExtraRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={addEmptyRoleRow}
                        className="inline-flex items-center text-[#EA1A62] hover:text-[#d01757] text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Dodaj rolę
                      </button>
                    )}
                </div>

                <Input
                  label="Termin zgłoszeń"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleBasicChange}
                  error={errors.deadline}
                  required
                />

                {/* Banner – upload + podgląd */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner castingu{" "}
                    {isUploadingBanner && (
                      <span className="text-xs text-gray-500">
                        (wysyłanie…)
                      </span>
                    )}
                  </label>

                  {!formData.bannerFile ? (
                    <label className="flex items-center justify-center w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#EA1A62]">
                      <span className="text-gray-500">
                        Kliknij, aby dodać banner
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            setFormData((prev) => ({
                              ...prev,
                              bannerFile: file,
                            }));
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full">
                      <BannerImage
                        src={URL.createObjectURL(formData.bannerFile)}
                        alt="Podgląd bannera"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, bannerFile: null }))
                        }
                        className="absolute top-2 right-2 bg-[#EA1A62] text-white rounded-full p-1 hover:bg-[#c7154f]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <Input
                  label="Tagi (oddzielone przecinkami, max 5)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleBasicChange}
                  placeholder="fashion, studio, outdoor"
                />

                <div className="flex space-x-3">
                  <Button type="submit">Utwórz casting</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Anuluj
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        )}

        {/* LISTA CASTINGÓW + ZGŁOSZENIA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-[#2B2628]">
                  Moje castingi
                </h2>
              </Card.Header>
              <Card.Content>
                {isLoading ? (
                  <p className="text-gray-500 text-center py-4">
                    Ładowanie castingów...
                  </p>
                ) : organizerCastings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nie masz jeszcze żadnych castingów
                  </p>
                ) : (
                  <div className="space-y-4">
                    {organizerCastings.map((c) => (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedCasting?.id === c.id}
                        aria-selected={selectedCasting?.id === c.id}
                        onClick={() => setSelectedCasting(c)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setSelectedCasting(c);
                        }}
                        className={[
                          "border rounded-lg p-4 cursor-pointer transition-colors outline-none",
                          "hover:bg-gray-50",
                          "focus:ring-2 focus:ring-[#EA1A62] focus:ring-offset-0",
                          selectedCasting?.id === c.id
                            ? "border-[#EA1A62] bg-pink-50 ring-2 ring-[#EA1A62]"
                            : "border-gray-200",
                        ].join(" ")}
                      >
                        {/* Banner (uniwersalny, bez zniekształceń i bez pustych pasów) */}
                        <div className="w-full mb-3">
                          {typeof castingBanners[c.id] === "string" &&
                          castingBanners[c.id] ? (
                            <BannerImage
                              src={castingBanners[c.id]}
                              alt={`Banner castingu ${c.title}`}
                              className="rounded-lg"
                            />
                          ) : (
                            <BannerPlaceholder />
                          )}
                        </div>

                        <h3 className="font-medium text-gray-900 mb-2">
                          {c.title}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {c.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(c.eventDate).toLocaleDateString("pl-PL")}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-2">
                          {c.roles?.map((role, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {roleDisplayMap[role.role] || role.role}{" "}
                              {role.acceptedCount || 0}/{role.capacity}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Utworzono:{" "}
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleDateString(
                                  "pl-PL"
                                )
                              : "-"}
                          </p>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Aktywny
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>

          <div>
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-[#2B2628]">
                  {selectedCasting
                    ? `Zgłoszenia: ${selectedCasting.title}`
                    : "Wybierz casting"}
                </h2>
              </Card.Header>
              <Card.Content>
                {!selectedCasting ? (
                  <p className="text-gray-500 text-center py-4">
                    Wybierz casting, aby zobaczyć zgłoszenia
                  </p>
                ) : (
                  (() => {
                    const castingApplications =
                      getCastingApplications(selectedCasting.id) || [];
                    return castingApplications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Brak zgłoszeń do tego castingu
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {castingApplications.map((application) => (
                          <div
                            key={application.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              {application.status === "pending" && (
                                <div className="flex space-x-2 mt-3">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        application.id,
                                        "accepted"
                                      )
                                    }
                                    className="flex-1"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Akceptuj
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(
                                        application.id,
                                        "rejected"
                                      )
                                    }
                                    className="flex-1"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Odrzuć
                                  </Button>
                                </div>
                              )}

                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                  <Users className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Użytkownik #{application.userId}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Zgłoszono:{" "}
                                    {new Date(
                                      application.appliedAt
                                    ).toLocaleDateString("pl-PL")}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  application.status
                                )}`}
                              >
                                {getStatusIcon(application.status)}
                                <span className="ml-1">
                                  {application.status === "pending"
                                    ? "Oczekuje"
                                    : application.status === "accepted"
                                    ? "Zaakceptowany"
                                    : "Odrzucony"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
