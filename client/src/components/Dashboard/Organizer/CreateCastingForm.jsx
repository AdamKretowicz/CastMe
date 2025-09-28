// src/components/Dashboard/Organizer/CreateCastingForm.jsx
import { useCallback, useMemo, useState } from "react";
import Card from "../../UI/Card";
import Button from "../../UI/Button";
import Input from "../../UI/Input";
import { X } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { BannerImage } from "../../UI/BannerImage";

const ALL_ROLES = ["Model", "Fotograf", "Projektant", "Wolontariusz"];

// UI (PL) -> API (EN)
const roleMap = {
  Model: "Model",
  Fotograf: "Photographer",
  Projektant: "Designer",
  Wolontariusz: "Volunteer",
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

/** Cache bannerów w localStorage — wspólny z hookiem useCastingBanners */
const BANNERS_STORAGE_KEY = "castingBannerUrls";
const readBannerCache = () => {
  try {
    return JSON.parse(localStorage.getItem(BANNERS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};
const writeBannerCache = (obj) => {
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(obj));
  } catch {}
};

export default function CreateCastingForm({
  onClose,
  onCreated,
  createCasting,
  onBannerUploaded, // opcjonalny callback z OrganizerDashboard
}) {
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
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

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

  /**
   * Upload bannera – POST /casting/casting/{castingId}/banner (pole: "File")
   * Po udanym uploadzie zapisujemy URL (z cache-bust) do localStorage,
   * aby UI natychmiast widziało obraz i nie robiło zbędnego GET, który może
   * chwilowo zwracać 404.
   */
  const uploadCastingBanner = useCallback(async (castingId, file) => {
    try {
      if (!castingId || !file) return null;

      const fd = new FormData();
      fd.append("File", file); // dokładnie tak jak w Swaggerze

      const res = await apiFetch(`/casting/casting/${castingId}/banner`, {
        method: "POST",
        body: fd,
      });

      const fileUrl = res?.url ? toAbsoluteUrl(res.url) : "";
      if (!fileUrl) {
        const cache = readBannerCache();
        writeBannerCache({ ...cache, [castingId]: null });
        return null;
      }

      const busted = bust(fileUrl);

      // natychmiast wrzuć do trwałego cache
      const cache = readBannerCache();
      writeBannerCache({ ...cache, [castingId]: busted });

      return busted;
    } catch (e) {
      console.error("Błąd uploadu bannera:", e);
      const cache = readBannerCache();
      writeBannerCache({ ...cache, [castingId]: null });
      return null;
    }
  }, []);

  /** Tworzenie castingu + ewentualny upload bannera */
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
          const url = await uploadCastingBanner(newId, formData.bannerFile);
          // poinformuj dashboard, aby ewentualnie dociągnął / odświeżył banner
          onBannerUploaded?.(newId, url);
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
      onCreated?.();
      alert("Casting został utworzony pomyślnie!");
    } catch (err) {
      console.error("Wyjątek przy tworzeniu castingu:", err);
      alert("Błąd podczas tworzenia castingu");
    }
  };

  return (
    <Card className="mb-8 relative">
      <button
        type="button"
        onClick={onClose}
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
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
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
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
              <p className="text-sm text-red-600 mt-1">{errors.requirements}</p>
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
                  <span>Dodaj wynagrodzenie</span>
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
                          setFormData((p) => ({ ...p, compensation: "" }));
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
                    errors["role-0"] ? "border-red-300" : "border-gray-300"
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
                        handleRoleFieldChange(i, "capacity", e.target.value)
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
                <span className="text-xs text-gray-500">(wysyłanie…)</span>
              )}
            </label>

            {!formData.bannerFile ? (
              <label className="flex items-center justify-center w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#EA1A62]">
                <span className="text-gray-500">Kliknij, aby dodać banner</span>
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
            <Button variant="outline" onClick={onClose}>
              Anuluj
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}
