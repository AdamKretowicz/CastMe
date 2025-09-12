import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCasting } from "../../context/CastingContext";
import {
  Plus,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Card from "../UI/Card";
import Button from "../UI/Button";
import Input from "../UI/Input";

const OrganizerDashboard = () => {
  const { currentUser } = useAuth();
  const {
    castings,
    createCasting,
    updateApplicationStatus,
    getCastingApplications,
  } = useCasting();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSalaryField, setShowSalaryField] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    roles: [{ role: "Model", places: 1 }], // domyślnie Model
    tags: [""],
    deadline: "",
  });
  const [errors, setErrors] = useState({});

  const availableRoles = ["Model", "Fotograf", "Projektant", "Wolontariusz"];

  const organizerCastings = castings.filter(
    (casting) => casting.organizerId === currentUser.id
  );

  const selectedRoles = useMemo(
    () => formData.roles.map((r) => r.role),
    [formData.roles]
  );

  const remainingRoles = useMemo(
    () => availableRoles.filter((r) => !selectedRoles.includes(r)),
    [availableRoles, selectedRoles]
  );

  const canAddRole = remainingRoles.length > 0;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title) newErrors.title = "Tytuł jest wymagany";
    else if (formData.title.length > 100)
      newErrors.title = "Tytuł nie może być dłuższy niż 100 znaków";

    if (!formData.description) newErrors.description = "Opis jest wymagany";
    else if (formData.description.length > 1000)
      newErrors.description = "Opis nie może być dłuższy niż 1000 znaków";

    if (!formData.location) newErrors.location = "Lokalizacja jest wymagana";
    else if (formData.location.length > 100)
      newErrors.location = "Lokalizacja nie może być dłuższa niż 100 znaków";

    if (showSalaryField && formData.salary && formData.salary.length > 50)
      newErrors.salary = "Wynagrodzenie nie może być dłuższe niż 50 znaków";

    if (
      !formData.roles.length ||
      formData.roles.some((r) => !r.places || r.places <= 0)
    )
      newErrors.roles = "Każda rola musi mieć co najmniej 1 miejsce";

    if (!formData.deadline) newErrors.deadline = "Termin jest wymagany";

    // unikaj duplikatów ról (dodatkowa asekuracja)
    const dup = formData.roles.map((r) => r.role);
    if (new Set(dup).size !== dup.length) {
      newErrors.roles = "Każda rola może wystąpić tylko raz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ===== R O L E =====
  const handleRoleUpdate = (index, field, value) => {
    const updated = [...formData.roles];
    updated[index][field] =
      field === "places" ? parseInt(value || 0, 10) : value;
    setFormData((prev) => ({ ...prev, roles: updated }));
    if (errors.roles) setErrors((prev) => ({ ...prev, roles: "" }));
  };

  const addRoleField = () => {
    if (!canAddRole) return;
    const nextRole = remainingRoles[0] || "Model";
    setFormData((prev) => ({
      ...prev,
      roles: [...prev.roles, { role: nextRole, places: 1 }],
    }));
  };

  const removeRoleField = (index) => {
    const updated = formData.roles.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, roles: updated }));
    if (errors.roles) setErrors((prev) => ({ ...prev, roles: "" }));
  };

  // ===== T A G I =====
  const handleTagChange = (index, value) => {
    const updated = [...formData.tags];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, tags: updated }));
  };

  const addTagField = () => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, ""] }));
  };

  const removeTagField = (index) => {
    const updated = formData.tags.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, tags: updated }));
  };

  // ===== S U B M I T =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const castingData = {
      ...formData,
      // jeśli salary ukryte, nie wysyłaj wartości
      ...(showSalaryField ? {} : { salary: "" }),
      organizerId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const result = await createCasting(castingData);

    if (result.success) {
      setFormData({
        title: "",
        description: "",
        location: "",
        salary: "",
        roles: [{ role: "Model", places: 1 }],
        tags: [""],
        deadline: "",
      });
      setShowSalaryField(false);
      setShowCreateForm(false);
      alert("Casting został utworzony pomyślnie!");
    }
  };

  const handleApplicationAction = (applicationId, action) => {
    updateApplicationStatus(applicationId, action);
    alert(
      `Zgłoszenie zostało ${
        action === "accepted" ? "zaakceptowane" : "odrzucone"
      }`
    );
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

  const formatDate = (date) => new Date(date).toLocaleDateString("pl-PL");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
              Witaj {currentUser.firstName}!
            </h1>
            <p className="text-gray-600">
              Zarządzaj swoimi castingami i zgłoszeniami
            </p>
          </div>

          {/* 🔥 Ukryj przycisk, gdy formularz otwarty */}
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nowy casting
            </Button>
          )}
        </div>

        {/* FORMULARZ DODAWANIA CASTINGU */}
        {showCreateForm && (
          <Card className="mb-8">
            <Card.Header>
              <h2 className="text-xl font-semibold text-[#2B2628]">
                Utwórz nowy casting
              </h2>
            </Card.Header>
            <Card.Content>
              {/* zwężenie formularza + siatka */}
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tytuł + Termin */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Tytuł"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      required
                      placeholder="Sesja zdjęciowa dla marki odzieżowej"
                    />
                    <Input
                      label="Termin zgłoszeń"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleChange}
                      error={errors.deadline}
                      required
                    />
                  </div>

                  {/* Opis (pełna szerokość) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] ${
                        errors.description
                          ? "border-red-300"
                          : "border-gray-300"
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

                  {/* Lokalizacja + (opcjonalnie) Wynagrodzenie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Lokalizacja"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      error={errors.location}
                      required
                      placeholder="Warszawa"
                    />

                    {!showSalaryField ? (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setShowSalaryField(true)}
                          className="text-[#EA1A62] text-sm font-medium hover:underline"
                          aria-label="Dodaj wynagrodzenie"
                        >
                          <span className="inline-flex items-center">
                            <Plus className="w-4 h-4 mr-1" />
                            Wynagrodzenie (opcjonalnie)
                          </span>
                        </button>
                      </div>
                    ) : (
                      <Input
                        label="Wynagrodzenie"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        error={errors.salary}
                        placeholder="np. 500-800 PLN"
                      />
                    )}
                  </div>

                  {showSalaryField && (
                    <div className="-mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSalaryField(false);
                          setFormData((p) => ({ ...p, salary: "" }));
                          if (errors.salary)
                            setErrors((prev) => ({ ...prev, salary: "" }));
                        }}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Usuń wynagrodzenie
                      </button>
                    </div>
                  )}

                  {/* Role z limitami (unikalne) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role i liczba miejsc
                    </label>
                    <div className="space-y-3">
                      {formData.roles.map((rf, index) => {
                        // opcje: wszystkie dostępne role z wyłączeniem już zaznaczonych,
                        // ale zawsze dozwolona rola bieżącego wiersza (żeby nie znikała z selecta)
                        const options = availableRoles.filter(
                          (r) => r === rf.role || !selectedRoles.includes(r)
                        );

                        return (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-3 items-center"
                          >
                            <div className="col-span-7 md:col-span-8">
                              <select
                                value={rf.role}
                                onChange={(e) =>
                                  handleRoleUpdate(
                                    index,
                                    "role",
                                    e.target.value
                                  )
                                }
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA1A62]"
                              >
                                {options.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-3 md:col-span-2">
                              <input
                                type="number"
                                min="1"
                                value={rf.places}
                                onChange={(e) =>
                                  handleRoleUpdate(
                                    index,
                                    "places",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA1A62]"
                                placeholder="1"
                              />
                            </div>
                            <div className="col-span-2 md:col-span-2">
                              {formData.roles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRoleField(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Usuń
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={addRoleField}
                          disabled={!canAddRole}
                          className={`text-sm font-medium ${
                            canAddRole
                              ? "text-[#EA1A62] hover:underline"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            canAddRole
                              ? "Dodaj rolę"
                              : "Dodano już wszystkie dostępne role"
                          }
                        >
                          + Dodaj rolę
                        </button>
                      </div>
                    </div>
                    {errors.roles && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.roles}
                      </p>
                    )}
                  </div>

                  {/* Tagi (siatka) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tagi
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) =>
                              handleTagChange(index, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA1A62]"
                            placeholder="np. fashion"
                          />
                          {formData.tags.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTagField(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Usuń
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={addTagField}
                        className="text-[#EA1A62] text-sm font-medium hover:underline"
                      >
                        + Dodaj tag
                      </button>
                    </div>
                  </div>

                  {/* Przyciski */}
                  <div className="flex gap-3">
                    <Button type="submit">Utwórz casting</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setShowSalaryField(false);
                      }}
                    >
                      Anuluj
                    </Button>
                  </div>
                </form>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* MOJE CASTINGI */}
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
                    {organizerCastings.map((casting) => (
                      <div
                        key={casting.id}
                        className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCasting?.id === casting.id
                            ? "border-[#EA1A62] bg-pink-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedCasting(casting)}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">
                          {casting.title}
                        </h3>
                        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {casting.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {Array.isArray(casting.roles)
                              ? casting.roles.reduce(
                                  (sum, r) => sum + (r.places || 0),
                                  0
                                )
                              : 0}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Utworzono: {formatDate(casting.createdAt)}
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

          {/* ZGŁOSZENIA DO WYBRANEGO CASTINGU */}
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
                                    {formatDate(application.appliedAt)}
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

                            {application.message && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  {application.message}
                                </p>
                              </div>
                            )}

                            {application.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApplicationAction(
                                      application.id,
                                      "accepted"
                                    )
                                  }
                                >
                                  Akceptuj
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleApplicationAction(
                                      application.id,
                                      "rejected"
                                    )
                                  }
                                >
                                  Odrzuć
                                </Button>
                              </div>
                            )}
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
