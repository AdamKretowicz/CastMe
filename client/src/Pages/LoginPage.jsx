import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "anna.kowalska@email.com",
    password: "password123",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Nieprawidłowy format email";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email nie może być dłuższy niż 100 znaków";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (formData.password.length < 8) {
      newErrors.password = "Hasło musi mieć minimum 8 znaków";
    } else if (formData.password.length > 64) {
      newErrors.password = "Hasło nie może być dłuższe niż 64 znaki";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = login(formData.email, formData.password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setErrors({ form: result.error });
      }
    } catch (error) {
      setErrors({ form: "Wystąpił błąd podczas logowania" });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
            Zaloguj się
          </h1>
          <p className="text-gray-600">Wprowadź swoje dane, aby kontynuować</p>
        </div>

        <Card>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.form}
                </div>
              )}

              <Input
                label="Adres email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="twoj@email.com"
              />

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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Nie masz konta?{" "}
                <Link
                  to="/register"
                  className="text-[#EA1A62] hover:text-[#d1185a] font-medium"
                >
                  Zarejestruj się
                </Link>
              </p>
            </div>
          </Card.Content>
        </Card>

        {/* Demo accounts info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            Konta demonstracyjne:
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              <strong>Model:</strong> anna.kowalska@email.com / password123
            </p>
            <p>
              <strong>Organizator:</strong> organizer@test.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
