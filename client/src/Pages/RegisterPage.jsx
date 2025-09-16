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
    UserName: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Password: "",
    Country: "",
    City: "",
    Gender: 0,
    DateOfBirth: "",
    Height: 0,
    Weight: 0,
    HairColor: "",
    ClothingSize: "",
    Description: "",
    RoleName: "",
    Photos: [],
    AcceptTerms: false,
    ConfirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const roles = ["Model", "Fotograf", "Projektant", "Wolontariusz"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10) || 0
          : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      Photos: [...prev.Photos, ...newFiles], // 🔥 doklejanie zamiast nadpisywania
    }));

    // reset input, żeby można było dodać ten sam plik ponownie
    e.target.value = "";
  };

  // Walidacja pierwszego kroku
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.FirstName) newErrors.FirstName = "Imię jest wymagane";
    if (!formData.LastName) newErrors.LastName = "Nazwisko jest wymagane";
    if (!formData.Email) newErrors.Email = "Email jest wymagany";
    if (!formData.Phone) newErrors.Phone = "Telefon jest wymagany";
    if (!formData.Password) newErrors.Password = "Hasło jest wymagane";
    if (formData.Password !== formData.ConfirmPassword)
      newErrors.ConfirmPassword = "Hasła muszą się zgadzać";
    if (!formData.AcceptTerms)
      newErrors.AcceptTerms = "Musisz zaakceptować regulamin";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Walidacja drugiego kroku
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.UserName)
      newErrors.UserName = "Nazwa użytkownika jest wymagana";
    if (!formData.RoleName) newErrors.RoleName = "Rola jest wymagana";
    if (!formData.DateOfBirth)
      newErrors.DateOfBirth = "Data urodzenia jest wymagana";
    if (!formData.Country) newErrors.Country = "Kraj jest wymagany";
    if (!formData.City) newErrors.City = "Miasto jest wymagane";
    if (!formData.HairColor) newErrors.HairColor = "Kolor włosów jest wymagany";
    if (!formData.ClothingSize)
      newErrors.ClothingSize = "Rozmiar odzieży jest wymagany";
    if (!formData.Height || formData.Height <= 0)
      newErrors.Height = "Wzrost jest wymagany";
    if (!formData.Weight || formData.Weight <= 0)
      newErrors.Weight = "Waga jest wymagana";
    if (!formData.Photos || formData.Photos.length === 0)
      newErrors.Photos = "Musisz dodać przynajmniej jedno zdjęcie";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        DateOfBirth: new Date(formData.DateOfBirth).toISOString(),
      };

      const result = await register(payload);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setErrors({ form: result.error });
      }
    } catch (error) {
      console.error(error);
      setErrors({ form: "Wystąpił błąd podczas rejestracji" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
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
                        name="FirstName"
                        value={formData.FirstName}
                        onChange={handleChange}
                        error={errors.FirstName}
                      />
                      <Input
                        label="Nazwisko"
                        name="LastName"
                        value={formData.LastName}
                        onChange={handleChange}
                        error={errors.LastName}
                      />
                      <Input
                        label="Email"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        error={errors.Email}
                      />
                      <Input
                        label="Telefon"
                        name="Phone"
                        value={formData.Phone}
                        onChange={handleChange}
                        error={errors.Phone}
                      />
                      <Input
                        label="Hasło"
                        name="Password"
                        type="password"
                        value={formData.Password}
                        onChange={handleChange}
                        error={errors.Password}
                      />
                      <Input
                        label="Potwierdź hasło"
                        name="ConfirmPassword"
                        type="password"
                        value={formData.ConfirmPassword}
                        onChange={handleChange}
                        error={errors.ConfirmPassword}
                      />

                      {/* Regulamin */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          name="AcceptTerms"
                          checked={formData.AcceptTerms}
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
                      {errors.AcceptTerms && (
                        <p className="text-red-500">{errors.AcceptTerms}</p>
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
                        name="UserName"
                        value={formData.UserName}
                        onChange={handleChange}
                        error={errors.UserName}
                      />
                      <Input
                        label="Data urodzenia"
                        name="DateOfBirth"
                        type="date"
                        value={formData.DateOfBirth}
                        onChange={handleChange}
                        error={errors.DateOfBirth}
                      />
                      <Input
                        label="Kraj"
                        name="Country"
                        value={formData.Country}
                        onChange={handleChange}
                        error={errors.Country}
                      />
                      <Input
                        label="Miasto"
                        name="City"
                        value={formData.City}
                        onChange={handleChange}
                        error={errors.City}
                      />

                      {/* Płeć */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Płeć
                        </label>
                        <div className="flex gap-4">
                          {[
                            { id: 1, label: "Mężczyzna" },
                            { id: 2, label: "Kobieta" },
                            { id: 3, label: "Inna" },
                          ].map((opt) => (
                            <label
                              key={opt.id}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="radio"
                                name="Gender"
                                value={opt.id}
                                checked={formData.Gender === opt.id}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    Gender: parseInt(e.target.value, 10),
                                  }))
                                }
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <Input
                        label="Wzrost"
                        name="Height"
                        type="number"
                        value={formData.Height}
                        onChange={handleChange}
                        error={errors.Height}
                      />
                      <Input
                        label="Waga (kg)"
                        name="Weight"
                        type="number"
                        value={formData.Weight}
                        onChange={handleChange}
                        error={errors.Weight}
                      />
                      <Input
                        label="Kolor włosów"
                        name="HairColor"
                        value={formData.HairColor}
                        onChange={handleChange}
                        error={errors.HairColor}
                      />
                      <Input
                        label="Rozmiar odzieży"
                        name="ClothingSize"
                        value={formData.ClothingSize}
                        onChange={handleChange}
                        error={errors.ClothingSize}
                      />
                      <Input
                        label="Opis"
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        error={errors.Description}
                      />

                      {/* Rola */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rola
                        </label>
                        <select
                          name="RoleName"
                          value={formData.RoleName}
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
                        {errors.RoleName && (
                          <p className="text-red-500">{errors.RoleName}</p>
                        )}
                      </div>

                      {/* Zdjęcia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zdjęcia
                        </label>

                        {/* Ukryty input plików */}
                        <input
                          type="file"
                          id="photoUpload"
                          name="Photos"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {/* Stylizowany button */}
                        <label
                          htmlFor="photoUpload"
                          className="inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg shadow hover:bg-pink-700 cursor-pointer"
                        >
                          Wybierz zdjęcia
                        </label>

                        {/* Lista kafelków */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {formData.Photos &&
                            Array.from(formData.Photos).map((file, index) => (
                              <div
                                key={index}
                                className="relative border rounded-lg p-2 flex flex-col items-center bg-gray-50 shadow-sm"
                              >
                                {/* Miniatura */}
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`photo-${index}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />

                                {/* Nazwa pliku */}
                                <p className="text-xs mt-2 text-gray-600 truncate w-full text-center">
                                  {file.name}
                                </p>

                                {/* Krzyżyk do usuwania */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedPhotos = [...formData.Photos];
                                    updatedPhotos.splice(index, 1);
                                    setFormData((prev) => ({
                                      ...prev,
                                      Photos: updatedPhotos,
                                    }));
                                  }}
                                  className="absolute top-1 right-1 bg-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-pink-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                        </div>

                        {errors.Photos && (
                          <p className="text-red-500 mt-2">{errors.Photos}</p>
                        )}
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
