import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCasting } from "../../context/CastingContext";
import {
  Plus,
  Edit,
  Users,
  Calendar,
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
    applications,
    createCasting,
    updateApplicationStatus,
    getCastingApplications,
  } = useCasting();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCasting, setSelectedCasting] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    tags: "",
    roles: ["Model"],
    maxPlaces: "",
    deadline: "",
  });
  const [errors, setErrors] = useState({});

  const organizerCastings = castings.filter(
    (casting) => casting.organizerId === currentUser.id
  );

  const availableRoles = ["Model", "Fotograf", "Projektant", "Wolontariusz"];

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

    if (formData.salary && formData.salary.length > 50)
      newErrors.salary = "Wynagrodzenie nie może być dłuższe niż 50 znaków";

    if (!formData.maxPlaces)
      newErrors.maxPlaces = "Liczba miejsc jest wymagana";
    else if (isNaN(formData.maxPlaces) || formData.maxPlaces <= 0)
      newErrors.maxPlaces = "Liczba miejsc musi być większa od 0";

    if (!formData.deadline) newErrors.deadline = "Termin jest wymagany";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRoleChange = (role, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, role],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        roles: prev.roles.filter((r) => r !== role),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const castingData = {
      ...formData,
      organizerId: currentUser.id,
      maxPlaces: parseInt(formData.maxPlaces),
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .slice(0, 5)
        : [],
    };

    const result = createCasting(castingData);

    if (result.success) {
      setFormData({
        title: "",
        description: "",
        location: "",
        salary: "",
        tags: "",
        roles: ["Model"],
        maxPlaces: "",
        deadline: "",
      });
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pl-PL");
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Tytuł"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
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
                    onChange={handleChange}
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

                  <Input
                    label="Wynagrodzenie"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    error={errors.salary}
                    placeholder="500-800 PLN"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Maksymalna liczba miejsc"
                    name="maxPlaces"
                    type="number"
                    value={formData.maxPlaces}
                    onChange={handleChange}
                    error={errors.maxPlaces}
                    required
                    placeholder="4"
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

                <Input
                  label="Tagi (oddzielone przecinkami, max 5)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="fashion, studio, outdoor"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Poszukiwane role
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableRoles.map((role) => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role)}
                          onChange={(e) =>
                            handleRoleChange(role, e.target.checked)
                          }
                          className="rounded border-gray-300 text-[#EA1A62] focus:ring-[#EA1A62]"
                        />
                        <span className="text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

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

        {/* My Castings */}
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
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {casting.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {casting.maxPlaces}
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

          {/* Applications for Selected Casting */}
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
