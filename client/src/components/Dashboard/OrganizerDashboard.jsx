import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
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
} from "lucide-react";
import Card from "../UI/Card";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { apiFetch } from "../../utils/api";

const ALL_ROLES = ["Model", "Fotograf", "Projektant", "Wolontariusz"];

/**
 * Backend oczekuje enumów ról w PascalCase (EN):
 *  - "Model"
 *  - "Photographer"
 *  - "Designer"
 *  - "Volunteer"
 * Dlatego mapujemy z polskich etykiet UI → wartości akceptowane przez API.
 */
const roleMap = {
  Model: "Model",
  Fotograf: "Photographer",
  Projektant: "Designer",
  Wolontariusz: "Volunteer",
};

const OrganizerDashboard = () => {
  const { currentUser } = useAuth();
  const { castings, createCasting, getCastingApplications } = useCasting();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    compensation: "", // opcjonalne – pokaż po kliknięciu plusa
    tags: "",
    roles: [{ role: "Model", capacity: "" }], // Model zawsze
    deadline: "",
    bannerFile: null, // 1 plik (na razie tylko UI)
  });

  const [showCompensation, setShowCompensation] = useState(false);
  const [errors, setErrors] = useState({});

  const organizerCastings = castings.filter(
    (c) => c.organizerId === currentUser.id
  );
  console.log("castings from context:", castings);
  console.log("currentUser in OrganizerDashboard:", currentUser);

  const selectedRoleNames = useMemo(
    () => formData.roles.map((r) => r.role).filter(Boolean),
    [formData.roles]
  );

  // role, które można jeszcze dodać (bez Modela – ten jest stały)
  const availableExtraRoles = useMemo(
    () =>
      ALL_ROLES.filter((r) => r !== "Model" && !selectedRoleNames.includes(r)),
    [selectedRoleNames]
  );

  const validateForm = () => {
    const e = {};

    // Title: min 5, max 100
    if (!formData.title) {
      e.title = "Tytuł jest wymagany";
    } else if (formData.title.length < 5 || formData.title.length > 100) {
      e.title = "Tytuł musi mieć od 5 do 100 znaków";
    }

    // Description: min 20, max 2000
    if (!formData.description) {
      e.description = "Opis jest wymagany";
    } else if (
      formData.description.length < 20 ||
      formData.description.length > 2000
    ) {
      e.description = "Opis musi mieć od 20 do 2000 znaków";
    }

    // Location: min 2, max 100
    if (!formData.location) {
      e.location = "Lokalizacja jest wymagana";
    } else if (formData.location.length < 2 || formData.location.length > 100) {
      e.location = "Lokalizacja musi mieć od 2 do 100 znaków";
    }

    // Deadline / eventDate
    if (!formData.deadline) {
      e.deadline = "Termin jest wymagany";
    }

    // Requirements: max 1000
    if (!formData.requirements) {
      e.requirements = "Wymagania są wymagane";
    } else if (formData.requirements.length > 1000) {
      e.requirements = "Wymagania nie mogą przekraczać 1000 znaków";
    }

    // Compensation: optional, max 100
    if (
      showCompensation &&
      formData.compensation &&
      formData.compensation.length > 100
    ) {
      e.compensation = "Wynagrodzenie nie może być dłuższe niż 100 znaków";
    }

    // Banner: max 1 file – masz już to w UI, walidacja dodatkowa:
    if (formData.bannerFile && formData.bannerFile.length > 1) {
      e.bannerFile = "Możesz dodać tylko jeden plik";
    }

    // Roles
    formData.roles.forEach((r, i) => {
      if (!r.role) {
        e[`role-${i}`] = "Wybierz rolę";
      } else if (!r.capacity || isNaN(r.capacity) || Number(r.capacity) <= 0) {
        e[`role-${i}`] = "Podaj poprawną liczbę miejsc";
      }
    });

    // Tags: max 5
    if (formData.tags) {
      const tagList = formData.tags.split(",").map((t) => t.trim());
      if (tagList.length > 5) {
        e.tags = "Możesz dodać maksymalnie 5 tagów";
      }
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
      if (p.roles.length >= ALL_ROLES.length) return p; // limit
      return {
        ...p,
        roles: [...p.roles, { role: "", capacity: "" }],
      };
    });
  };

  const removeRoleRow = (index) => {
    setFormData((p) => ({
      ...p,
      roles: p.roles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    console.log("currentUser:", currentUser);
    e.preventDefault();
    if (!validateForm()) return;

    // ustalmy godzinę na 12:00, żeby uniknąć niespodzianek TZ
    const event = new Date(formData.deadline);
    event.setHours(12, 0, 0, 0);

    const castingData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      eventDate: event.toISOString(),
      requirements: formData.requirements,
      compensation: showCompensation ? formData.compensation : "",
      bannerUrl: formData.bannerFile
        ? URL.createObjectURL(formData.bannerFile)
        : "",
      roles: formData.roles
        .filter((r) => r.role) // ignoruj puste wiersze
        .map((r) => ({
          // KLUCZOWE: wysyłamy wartości akceptowane przez API
          role: roleMap[r.role],
          capacity: parseInt(r.capacity, 10),
        })),
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .slice(0, 5)
        : [],
    };
    console.log("castingData wysyłane do backendu:", castingData);

    const result = await createCasting(castingData);

    if (result.success) {
      setFormData({
        title: "",
        description: "",
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
    } else {
      alert("Błąd podczas tworzenia castingu");
      console.error(result.error);
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

  const formatDate = (d) => new Date(d).toLocaleDateString("pl-PL");

  const handleUpdateStatus = async (applicationId, newStatus) => {
    if (!selectedCasting) return;
    try {
      await apiFetch(
        `/casting/casting/${applicationId}/status?castingId=${selectedCasting.id}&status=${newStatus}`,
        { method: "GET" } // według Swaggera zmiana statusu jest na GET
      );

      // Odśwież zgłoszenia po akcji – np. wywołaj contextową funkcję
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

        {/* Create Casting Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <Card.Header>
              <h2 className="text-xl font-semibold text-[#2B2628]">
                Utwórz nowy casting
              </h2>
            </Card.Header>
            <Card.Content>
              {/* zwężenie formularza */}
              <form
                onSubmit={handleSubmit}
                className="space-y-6 max-w-3xl mx-auto"
              >
                {/* Tytuł (full width) */}
                <Input
                  label="Tytuł"
                  name="title"
                  value={formData.title}
                  onChange={handleBasicChange}
                  error={errors.title}
                  required
                  placeholder="Sesja zdjęciowa dla marki odzieżowej"
                />

                {/* Opis (full width) */}
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

                {/* Wiersz: Lokalizacja (węższa) + plusik Wynagrodzenie / pole Wynagrodzenie */}
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
                    const i = idx + 1; // realny index w roles
                    // opcje dla tego selecta: rola aktualnie wybrana + wszystkie jeszcze nieużyte
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

                  {/* Plusik dodający kolejną rolę */}
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

                {/* Termin */}
                <Input
                  label="Termin zgłoszeń"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleBasicChange}
                  error={errors.deadline}
                  required
                />

                {/* Banner – styl jak upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner castingu
                  </label>

                  {!formData.bannerFile ? (
                    <label className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#EA1A62]">
                      <span className="text-gray-500">
                        Kliknij, aby dodać banner
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData((prev) => ({
                              ...prev,
                              bannerFile: file,
                            }));
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full h-40 border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={URL.createObjectURL(formData.bannerFile)}
                        alt="Podgląd bannera"
                        className="object-contain w-full h-full"
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

                {/* Tagi */}
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

        {/* Lista castingów i zgłoszeń – bez zmian funkcjonalnych */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-[#2B2628]">
                  Moje castingi
                </h2>
              </Card.Header>
              <Card.Content>
                {organizerCastings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nie masz jeszcze żadnych castingów
                  </p>
                ) : (
                  <div className="space-y-4">
                    {organizerCastings.map((c) => (
                      <div
                        key={c.id}
                        className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCasting?.id === c.id
                            ? "border-[#EA1A62] bg-pink-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedCasting(c)}
                      >
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

                        {/* Role with counts */}
                        <div className="flex flex-wrap gap-3 mb-2">
                          {c.roles?.map((role, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {role.role} {role.acceptedCount}/{role.capacity}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Utworzono:{" "}
                            {c.createdAt ? formatDate(c.createdAt) : "-"}
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
                    const castingApplications = getCastingApplications(
                      selectedCasting.id
                    );
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
