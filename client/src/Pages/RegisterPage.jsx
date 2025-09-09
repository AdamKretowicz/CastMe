import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Model",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: "Model", label: "Model" },
    { value: "Fotograf", label: "Fotograf" },
    { value: "Projektant", label: "Projektant" },
    { value: "Wolontariusz", label: "Wolontariusz" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "Imię jest wymagane";
    else if (formData.firstName.length < 2)
      newErrors.firstName = "Imię musi mieć minimum 2 znaki";
    else if (formData.firstName.length > 50)
      newErrors.firstName = "Imię nie może być dłuższe niż 50 znaków";

    if (!formData.lastName) newErrors.lastName = "Nazwisko jest wymagane";
    else if (formData.lastName.length < 2)
      newErrors.lastName = "Nazwisko musi mieć minimum 2 znaki";
    else if (formData.lastName.length > 50)
      newErrors.lastName = "Nazwisko nie może być dłuższe niż 50 znaków";

    if (!formData.email) newErrors.email = "Email jest wymagany";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Nieprawidłowy format email";
    else if (formData.email.length > 100)
      newErrors.email = "Email nie może być dłuższy niż 100 znaków";

    if (!formData.password) newErrors.password = "Hasło jest wymagane";
    else if (formData.password.length < 8)
      newErrors.password = "Hasło musi mieć minimum 8 znaków";
    else if (formData.password.length > 64)
      newErrors.password = "Hasło nie może być dłuższe niż 64 znaki";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Hasła nie są identyczne";

    if (!formData.acceptTerms)
      newErrors.acceptTerms =
        "Musisz zaakceptować regulamin, aby korzystać z serwisu";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = register(formData);
      if (result.success) navigate("/dashboard");
      else setErrors({ form: result.error });
    } catch (error) {
      setErrors({ form: "Wystąpił błąd podczas rejestracji" });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Content strony */}
      <div
        className={`${
          showModal ? "opacity-40" : "opacity-100"
        } transition-opacity duration-300`}
      >
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
                Dołącz do CastMe
              </h1>
              <p className="text-gray-600">
                Utwórz swoje konto i rozpocznij przygodę
              </p>
            </div>

            <Card>
              <Card.Content>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.form && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {errors.form}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Imię"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      required
                      placeholder="Jan"
                    />
                    <Input
                      label="Nazwisko"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      required
                      placeholder="Kowalski"
                    />
                  </div>

                  <Input
                    label="Adres email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    placeholder="jan@email.com"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rola <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62]"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Hasło"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    placeholder="••••••••"
                  />
                  <Input
                    label="Potwierdź hasło"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                    placeholder="••••••••"
                  />

                  {/* Checkbox z regulaminem */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#EA1A62] border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Zaakceptuj regulamin aby korzystać z serwisu. Regulamin
                      znajdziesz{" "}
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.acceptTerms}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Rejestrowanie..." : "Utwórz konto"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Masz już konto?{" "}
                    <Link
                      to="/login"
                      className="text-[#EA1A62] hover:text-[#d1185a] font-medium"
                    >
                      Zaloguj się
                    </Link>
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 transform transition-all duration-300 ease-out scale-95 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Regulamin</h2>
            <div className="text-gray-700 max-h-64 overflow-y-auto">
              <div className="text-gray-700 max-h-64 overflow-y-auto">
                <p className="mb-2">
                  <strong>1. Cel przetwarzania danych:</strong> Twoje dane
                  osobowe (imię, nazwisko, wymiary, zdjęcia) są zbierane w celu
                  umożliwienia udziału w castingu, kontaktu z organizatorami
                  oraz prezentacji Twojego profilu w serwisie CastMe.
                </p>
                <p className="mb-2">
                  <strong>2. Zakres danych:</strong> Imię i nazwisko, dane
                  kontaktowe, wymiary, zdjęcia portfolio oraz inne informacje
                  podane w formularzu.
                </p>
                <p className="mb-2">
                  <strong>3. Podstawa prawna:</strong> Przetwarzanie odbywa się
                  na podstawie Twojej zgody, którą możesz w każdej chwili
                  cofnąć.
                </p>
                <p className="mb-2">
                  <strong>4. Udostępnianie danych:</strong> Twoje dane mogą być
                  widoczne dla organizatorów castingów oraz partnerów platformy
                  w celu realizacji projektów castingowych.
                </p>
                <p className="mb-2">
                  <strong>5. Prawa użytkownika:</strong> Masz prawo do dostępu,
                  poprawienia, usunięcia lub ograniczenia przetwarzania danych.
                  Możesz wycofać zgodę w dowolnym momencie, kontaktując się z
                  administratorem.
                </p>
                <p className="mb-2">
                  <strong>6. Bezpieczeństwo danych:</strong> Dane są chronione
                  zgodnie z zasadami bezpieczeństwa danych osobowych, dostęp
                  mają tylko uprawnione osoby.
                </p>
                <p className="mb-2">
                  <strong>7. Zdjęcia i materiały wizualne:</strong> Zdjęcia i
                  materiały mogą być wykorzystywane w kontekście castingu i
                  promowania talentów w serwisie. Nie będą używane w celach
                  komercyjnych poza platformą bez Twojej zgody.
                </p>
                <p className="mb-2">
                  <strong>8. Kontakt:</strong> W razie pytań dotyczących danych
                  osobowych, prosimy o kontakt na email:{" "}
                  <a
                    href="mailto:privacy@castme.com"
                    className="text-[#EA1A62] hover:underline"
                  >
                    privacy@castme.com
                  </a>
                </p>
              </div>
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
