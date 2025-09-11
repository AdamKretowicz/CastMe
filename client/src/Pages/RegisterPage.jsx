import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import { policy } from "../data/policy";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    city: "",
    gender: "",
    dateOfBirth: "",
    height: "",
    weight: "",
    hairColor: "",
    clothingSize: "",
    description: "",
    role: "",
    photos: [""], // tablica zdjęć
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const roles = ["Model", "Fotograf", "Projektant", "Wolontariusz"];

  const handleChange = (e, index = null) => {
    const { name, value, type, checked } = e.target;

    // Obsługa dynamicznych zdjęć
    if (name === "photos" && index !== null) {
      const updatedPhotos = [...formData.photos];
      updatedPhotos[index] = value;
      setFormData((prev) => ({ ...prev, photos: updatedPhotos }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addPhotoField = () => {
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ""] }));
  };

  // Walidacja pierwszego kroku
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "Imię jest wymagane";
    else if (formData.firstName.length < 2)
      newErrors.firstName = "Imię musi mieć min. 2 znaki";

    if (!formData.lastName) newErrors.lastName = "Nazwisko jest wymagane";
    else if (formData.lastName.length < 2)
      newErrors.lastName = "Nazwisko musi mieć min. 2 znaki";

    if (!formData.email) newErrors.email = "Email jest wymagany";
    if (!formData.phone) newErrors.phone = "Telefon jest wymagany";

    if (!formData.password) newErrors.password = "Hasło jest wymagane";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Hasła muszą się zgadzać";

    if (!formData.acceptTerms)
      newErrors.acceptTerms = "Musisz zaakceptować regulamin";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Walidacja drugiego kroku
  const validateStep2 = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.userName)
      newErrors.userName = "Nazwa użytkownika jest wymagana";
    else if (formData.userName.length < 3)
      newErrors.userName = "Nazwa użytkownika min. 3 znaki";

    if (!formData.role) newErrors.role = "Rola jest wymagana";

    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Data urodzenia jest wymagana";
    else if (formData.dateOfBirth > today)
      newErrors.dateOfBirth = "Data urodzenia nie może być przyszła";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const result = await register(formData);
      if (result.success) navigate("/dashboard");
      else setErrors({ form: result.error });
    } catch (error) {
      console.error(error);
      setErrors({ form: "Wystąpił błąd podczas rejestracji" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Strona główna z formularzem */}
      <div
        className={`${
          showModal ? "opacity-40" : "opacity-100"
        } transition-opacity`}
      >
        <div className="flex items-center justify-center py-12 px-4 min-h-screen bg-gray-50">
          <div className="max-w-lg w-full">
            <h1 className="text-3xl font-bold text-center mb-6">
              Dołącz do CastMe
            </h1>

            {/* 🔥 Wskaźnik postępu */}
            <div className="mb-4">
              <p className="text-center text-sm font-medium">Krok {step} z 2</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === 1 ? "w-1/2 bg-pink-500" : "w-full bg-pink-500"
                  }`}
                ></div>
              </div>
            </div>

            <Card>
              <Card.Content>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.form && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                      {errors.form}
                    </div>
                  )}

                  {/* Step 1 */}
                  {step === 1 && (
                    <>
                      <Input
                        label="Imię"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                      />
                      <Input
                        label="Nazwisko"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                      />
                      <Input
                        label="Telefon"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                      />
                      <Input
                        label="Hasło"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                      />
                      <Input
                        label="Potwierdź hasło"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                      />

                      {/* Regulamin */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          className="h-4 w-4 text-[#EA1A62] border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Zaakceptuj regulamin aby korzystać z serwisu.
                          Regulamin znajdziesz{" "}
                          <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="text-[#EA1A62] hover:underline"
                          >
                            tutaj
                          </button>
                          .
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="text-red-500">{errors.acceptTerms}</p>
                      )}

                      {/* Nawigacja */}
                      <div className="flex justify-between mt-6">
                        <button
                          type="button"
                          disabled
                          className="bg-gray-300 text-gray-500 py-2 px-6 rounded-lg w-32 cursor-not-allowed"
                        >
                          Wstecz
                        </button>
                        <Button
                          type="button"
                          onClick={() => validateStep1() && setStep(2)}
                          className="w-32 py-2 text-lg"
                        >
                          Dalej
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <>
                      <Input
                        label="Nazwa użytkownika"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        error={errors.userName}
                      />
                      <Input
                        label="Data urodzenia"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        error={errors.dateOfBirth}
                      />
                      <Input
                        label="Kraj"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                      <Input
                        label="Miasto"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />

                      {/* Płeć */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Płeć
                        </label>
                        <div className="flex gap-4">
                          {["Mężczyzna", "Kobieta", "Inna"].map(
                            (label, idx) => (
                              <label
                                key={label}
                                className="flex items-center gap-1"
                              >
                                <input
                                  type="radio"
                                  name="gender"
                                  value={idx}
                                  checked={formData.gender === String(idx)}
                                  onChange={handleChange}
                                />
                                {label}
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      <Input
                        label="Wzrost"
                        name="height"
                        type="number"
                        value={formData.height}
                        onChange={handleChange}
                      />
                      <Input
                        label="Waga (kg)"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                      <Input
                        label="Kolor włosów"
                        name="hairColor"
                        value={formData.hairColor}
                        onChange={handleChange}
                      />
                      <Input
                        label="Wymiary (biust, klatka, talia, biodra, rozmiar ubrania, stopy)"
                        name="clothingSize"
                        value={formData.clothingSize}
                        onChange={handleChange}
                      />
                      <Input
                        label="Opis"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />

                      {/* Stylizowany select roli */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rola
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62]"
                        >
                          <option value="">Wybierz rolę</option>
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {errors.role && (
                          <p className="text-red-500">{errors.role}</p>
                        )}
                      </div>

                      {/* Wiele zdjęć */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zdjęcia
                        </label>
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              name="photos"
                              value={photo}
                              onChange={(e) => handleChange(e, index)}
                              placeholder="Link do zdjęcia"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62]"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addPhotoField}
                          className="text-pink-600 hover:underline text-sm"
                        >
                          + Dodaj kolejne zdjęcie
                        </button>
                      </div>

                      {/* Nawigacja */}
                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-32 py-2 text-lg"
                        >
                          Wstecz
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-32 py-2 text-lg"
                        >
                          {isLoading ? "Rejestruję..." : "Zarejestruj"}
                        </Button>
                      </div>
                    </>
                  )}
                </form>

                <p className="mt-6 text-center text-gray-600">
                  Masz już konto?{" "}
                  <Link to="/login" className="text-[#EA1A62] font-medium">
                    Zaloguj się
                  </Link>
                </p>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal z regulaminem */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 transform transition-all duration-300 ease-out scale-95 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Regulamin</h2>
            <div className="text-gray-700 max-h-64 overflow-y-auto">
              {policy.map((item) => (
                <div key={item.id} className="mb-4">
                  <p>
                    <strong>
                      {item.id}. {item.title}
                    </strong>
                  </p>
                  <p>{item.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowModal(false)}>Zamknij</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
