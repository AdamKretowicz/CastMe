// src/pages/EditProfilePage.jsx

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchUserProfile,
  updateUserProfile,
  fetchUserPhotos,
  addUserPhoto,
  deleteUserPhoto,
  setMainUserPhoto,
  addUserExperience,
  updateUserExperience,
  deleteUserExperience,
  getPhotoUrl,
} from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Textarea from "../components/UI/Textarea";
import Select from "../components/UI/Select";
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Ruler,
  Weight,
  Palette,
  Shirt,
  Info,
  Camera,
  Briefcase,
  Plus,
  Trash2,
  Star,
  Edit3,
  Upload,
  X,
} from "lucide-react";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { accessToken, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form data
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    email: "",
    country: "",
    city: "",
    gender: 1,
    height: 0,
    weight: 0,
    hairColor: "",
    clothingSize: "",
    description: "",
  });

  // Photos state
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Experience state
  const [experiences, setExperiences] = useState([]);
  const [editingExperience, setEditingExperience] = useState(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState(null);

  const [experienceForm, setExperienceForm] = useState({
    projectName: "",
    role: "",
    description: "",
    startDate: "",
    endDate: "",
    link: "",
    stillWorking: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const genderOptions = [
    { value: 1, label: "Mężczyzna" },
    { value: 2, label: "Kobieta" },
    { value: 3, label: "Inne" },
  ];

  const clothingSizeOptions = [
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];

  const hairColorOptions = [
    { value: "Blond", label: "Blond" },
    { value: "Brązowe", label: "Brązowe" },
    { value: "Czarne", label: "Czarne" },
    { value: "Rude", label: "Rude" },
    { value: "Siwe", label: "Siwe" },
    { value: "Inne", label: "Inne" },
  ];

  useEffect(() => {
    if (!accessToken || !currentUser) {
      navigate("/login");
      return;
    }

    loadUserData();
  }, [accessToken, currentUser, navigate]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profileData, photosData] = await Promise.all([
        fetchUserProfile(currentUser.id, accessToken),
        fetchUserPhotos(currentUser.id, accessToken),
      ]);

      setFormData({
        userName: profileData.userName || "",
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
        dateOfBirth: profileData.dateOfBirth
          ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
          : "",
        email: profileData.email || "",
        country: profileData.country || "",
        city: profileData.city || "",
        gender: profileData.gender || 1,
        height: profileData.height || 0,
        weight: profileData.weight || 0,
        hairColor: profileData.hairColor || "",
        clothingSize: profileData.clothingSize || "",
        description: profileData.description || "",
      });

      setPhotos(photosData || []);
      setExperiences(profileData.experiences || []);
    } catch (err) {
      setError(err.message || "Błąd pobierania danych");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : null,
        height: Number(formData.height),
        weight: Number(formData.weight),
      };

      await updateUserProfile(currentUser.id, submitData, accessToken);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${currentUser.id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || "Błąd aktualizacji profilu");
    } finally {
      setSaving(false);
    }
  };

  // Photo handlers
  const handlePhotoUpload = async () => {
    if (photoFiles.length === 0) return;
    setUploadingPhoto(true);

    try {
      for (const file of photoFiles) {
        await addUserPhoto(currentUser.id, file, accessToken);
      }
      setPhotoFiles([]);
      const photosData = await fetchUserPhotos(currentUser.id, accessToken);
      setPhotos(photosData || []);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Błąd dodawania zdjęć");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deleteUserPhoto(currentUser.id, photoId, accessToken);
      const photosData = await fetchUserPhotos(currentUser.id, accessToken);
      setPhotos(photosData || []);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Błąd usuwania zdjęcia");
    }
  };

  const handleSetMainPhoto = async (photoId) => {
    try {
      await setMainUserPhoto(currentUser.id, photoId, accessToken);
      const photosData = await fetchUserPhotos(currentUser.id, accessToken);
      setPhotos(photosData || []);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Błąd ustawiania głównego zdjęcia");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) =>
      setPhotoFiles((prev) => [...prev, ...acceptedFiles]),
    accept: { "image/*": [] },
    multiple: true,
  });

  // Paste from clipboard (multi-photo compatible)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        setPhotoFiles((prev) => [...prev, ...files]);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Experience handlers
  const handleExperienceInputChange = (field, value) => {
    setExperienceForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddExperience = () => {
    setExperienceForm({
      projectName: "",
      role: "",
      description: "",
      startDate: "",
      endDate: "",
      link: "",
    });
    setEditingExperience(null);
    setShowExperienceForm(true);
  };

  const handleEditExperience = (experience) => {
    setExperienceForm({
      projectName: experience.projectName || "",
      role: experience.role || "",
      description: experience.description || "",
      startDate: experience.startDate
        ? new Date(experience.startDate).toISOString().split("T")[0]
        : "",
      endDate: experience.endDate
        ? new Date(experience.endDate).toISOString().split("T")[0]
        : "",
      link: experience.link || "",
    });
    setEditingExperience(experience);
    setShowExperienceForm(true);
  };

  const handleSaveExperience = async () => {
    try {
      // Build submit data
      const submitData = {
        projectName: experienceForm.projectName,
        role: experienceForm.role,
        description: experienceForm.description,
        startDate: experienceForm.startDate
          ? new Date(experienceForm.startDate).toISOString()
          : null,
        // Only include endDate if not still working
        ...(experienceForm.stillWorking
          ? {}
          : {
              endDate: experienceForm.endDate
                ? new Date(experienceForm.endDate).toISOString()
                : null,
            }),
        // Only include link if not empty
        ...(experienceForm.link ? { link: experienceForm.link } : {}),
      };

      if (editingExperience) {
        await updateUserExperience(
          currentUser.id,
          editingExperience.id,
          submitData,
          accessToken
        );
      } else {
        await addUserExperience(currentUser.id, submitData, accessToken);
      }

      const profileData = await fetchUserProfile(currentUser.id, accessToken);
      setExperiences(profileData.experiences || []);
      setShowExperienceForm(false);
      setEditingExperience(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Błąd zapisywania doświadczenia");
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    try {
      await deleteUserExperience(currentUser.id, experienceId, accessToken);
      const profileData = await fetchUserProfile(currentUser.id, accessToken);
      setExperiences(profileData.experiences || []);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Błąd usuwania doświadczenia");
    }
  };

  if (loading)
    return <div className="text-center py-10">Ładowanie profilu...</div>;

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "photos", label: "Zdjęcia", icon: Camera },
    { id: "experience", label: "Doświadczenie", icon: Briefcase },
  ];

  return (
    <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/profile/${currentUser.id}`)}
            className="flex items-center text-[#EA1A62] hover:text-[#c91653] transition-colors"
          >
            <ArrowLeft size={24} className="mr-2" />
            Wróć do profilu
          </button>
          <h1 className="text-3xl font-bold">Edytuj profil</h1>
          <div></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#EA1A62] text-[#EA1A62]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <IconComponent size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Operacja zakończona pomyślnie!
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit}>
            {/* Podstawowe informacje */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6">
                <User size={24} className="inline mr-2 text-[#EA1A62]" />
                Podstawowe informacje
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nazwa użytkownika"
                  value={formData.userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                  required
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
                <Input
                  label="Imię"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  required
                />
                <Input
                  label="Nazwisko"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  required
                />
                <Input
                  label="Telefon"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                <Input
                  label="Data urodzenia"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </div>
            </Card>

            {/* Lokalizacja */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6">
                <MapPin size={24} className="inline mr-2 text-[#EA1A62]" />
                Lokalizacja
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Kraj"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
                <Input
                  label="Miasto"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
            </Card>

            {/* Dane fizyczne */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6">
                <Ruler size={24} className="inline mr-2 text-[#EA1A62]" />
                Dane fizyczne
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  label="Płeć"
                  value={formData.gender}
                  onChange={(e) =>
                    handleInputChange("gender", Number(e.target.value))
                  }
                  options={genderOptions}
                />
                <Input
                  label="Wzrost (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  min="0"
                  max="250"
                />
                <Input
                  label="Waga (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  min="0"
                  max="200"
                />
                <Select
                  label="Kolor włosów"
                  value={formData.hairColor}
                  onChange={(e) =>
                    handleInputChange("hairColor", e.target.value)
                  }
                  options={hairColorOptions}
                />
              </div>

              <div className="mt-4">
                <Select
                  label="Rozmiar odzieży"
                  value={formData.clothingSize}
                  onChange={(e) =>
                    handleInputChange("clothingSize", e.target.value)
                  }
                  options={clothingSizeOptions}
                />
              </div>
            </Card>

            {/* Opis */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6">
                <Info size={24} className="inline mr-2 text-[#EA1A62]" />O mnie
              </h2>

              <Textarea
                label="Opis"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={6}
                placeholder="Opowiedz coś o sobie..."
              />
            </Card>

            {/* Przyciski akcji */}
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                onClick={() => navigate(`/profile/${currentUser.id}`)}
                className="bg-gray-500 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#EA1A62] text-white px-8 py-3 rounded-full font-bold hover:bg-[#c91653] transition-colors disabled:opacity-50"
              >
                <Save size={20} className="inline mr-2" />
                {saving ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        )}

        {/* Photos Tab */}
        {activeTab === "photos" && (
          <div>
            {/* Upload Photo */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Upload size={24} className="text-[#EA1A62]" />
                Dodaj nowe zdjęcia
              </h2>

              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer ${
                  isDragActive
                    ? "border-[#EA1A62] bg-[#ffe6f0]"
                    : "border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                <p className="mb-2 text-gray-500 text-center">
                  Przeciągnij i upuść zdjęcia tutaj, lub kliknij aby wybrać z
                  folderu
                </p>
                <p className="text-gray-400 text-sm">
                  Możesz też wkleić zdjęcia (Ctrl + V)
                </p>
              </div>

              {photoFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {photoFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() =>
                          setPhotoFiles((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photoFiles.length > 0 && (
                <Button
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="mt-4 bg-[#EA1A62] text-white px-6 py-2 rounded-full font-bold hover:bg-[#c91653] transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? "Wysyłanie..." : "Dodaj zdjęcia"}
                </Button>
              )}
            </Card>

            {/* Photos Grid */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">
                <Camera size={24} className="inline mr-2 text-[#EA1A62]" />
                Twoje zdjęcia
              </h2>

              {photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nie masz jeszcze żadnych zdjęć
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={getPhotoUrl(photo.url)}
                        alt="User photo"
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />

                      {/* Photo Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        {!photo.isMain && (
                          <button
                            onClick={() => handleSetMainPhoto(photo.id)}
                            className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                            title="Ustaw jako główne"
                          >
                            <Star size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          title="Usuń"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Main Photo Badge */}
                      {photo.isMain && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                          <Star size={12} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === "experience" && (
          <div>
            {/* Add Experience Button */}
            <Card className="p-6 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                  <Briefcase size={24} className="inline mr-2 text-[#EA1A62]" />
                  Doświadczenie zawodowe
                </h2>
                <Button
                  onClick={handleAddExperience}
                  className="bg-[#EA1A62] text-white px-4 py-2 rounded-full font-bold hover:bg-[#c91653] transition-colors"
                >
                  <Plus size={16} className="inline mr-2" />
                  Dodaj doświadczenie
                </Button>
              </div>
            </Card>
            {/* Experience Form */}
            {showExperienceForm && (
              <Card className="p-6 mb-6 border-l-4 border-[#EA1A62]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    {editingExperience
                      ? "Edytuj doświadczenie"
                      : "Dodaj nowe doświadczenie"}
                  </h3>
                  <button
                    onClick={() => setShowExperienceForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nazwa projektu"
                    value={experienceForm.projectName}
                    onChange={(e) =>
                      handleExperienceInputChange("projectName", e.target.value)
                    }
                    required
                  />
                  <Input
                    label="Rola"
                    value={experienceForm.role}
                    onChange={(e) =>
                      handleExperienceInputChange("role", e.target.value)
                    }
                    required
                  />

                  {/* Start and End Dates */}
                  <Input
                    label="Data rozpoczęcia"
                    type="date"
                    value={experienceForm.startDate}
                    onChange={(e) =>
                      handleExperienceInputChange("startDate", e.target.value)
                    }
                  />

                  {!experienceForm.stillWorking && (
                    <Input
                      label="Data zakończenia"
                      type="date"
                      value={experienceForm.endDate}
                      onChange={(e) =>
                        handleExperienceInputChange("endDate", e.target.value)
                      }
                    />
                  )}

                  {/* Checkbox under dates, full width */}
                  <div className="md:col-span-2 flex align-right gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="stillWorking"
                      checked={experienceForm.stillWorking || false}
                      onChange={(e) =>
                        handleExperienceInputChange(
                          "stillWorking",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="stillWorking" className="text-gray-700">
                      Nadal pracuję tutaj
                    </label>
                  </div>

                  {/* Optional Link */}
                  <div className="md:col-span-2">
                    <Input
                      label="Link"
                      value={experienceForm.link}
                      onChange={(e) =>
                        handleExperienceInputChange("link", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Textarea
                    label="Opis"
                    value={experienceForm.description}
                    onChange={(e) =>
                      handleExperienceInputChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="Opisz swoje doświadczenie..."
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowExperienceForm(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-full font-bold hover:bg-gray-600 transition-colors"
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleSaveExperience}
                    className="bg-[#EA1A62] text-white px-6 py-2 rounded-full font-bold hover:bg-[#c91653] transition-colors"
                  >
                    <Save size={16} className="inline mr-2" />
                    Zapisz
                  </Button>
                </div>
              </Card>
            )}

            {/* Experience List */}
            {experiences.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-8 text-gray-500">
                  Nie masz jeszcze żadnego doświadczenia zawodowego
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {experiences
                  .filter(
                    (exp) =>
                      !editingExperience || exp.id !== editingExperience.id
                  ) // hide the one being edited
                  .map((exp) => (
                    <Card key={exp.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">
                            {exp.projectName}
                          </h3>
                          <p className="font-medium text-[#EA1A62]">
                            {exp.role}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            {exp.startDate &&
                              new Date(exp.startDate).toLocaleDateString()}{" "}
                            -{" "}
                            {exp.endDate &&
                              new Date(exp.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-700 mb-2">
                            {exp.description}
                          </p>
                          {exp.link && (
                            <a
                              href={exp.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#EA1A62] hover:underline"
                            >
                              Zobacz projekt
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditExperience(exp)}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                            title="Edytuj"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setExperienceToDelete(exp)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="Usuń"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
            {experienceToDelete && (
              <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.30)] z-50">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Potwierdź usunięcie
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Czy na pewno chcesz usunąć doświadczenie{" "}
                    <span className="font-medium text-[#EA1A62]">
                      {experienceToDelete.projectName}
                    </span>
                    ?
                  </p>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setExperienceToDelete(null)}
                      className="px-4 py-2 rounded-full bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteExperience(experienceToDelete.id);
                        setExperienceToDelete(null);
                      }}
                      className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Tak, usuń
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
