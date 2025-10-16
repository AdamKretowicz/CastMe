import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const EMAIL_MAX = 100;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;

// username – 3–32 znaki, litery/cyfry/._-
const USERNAME_MIN = 3;
const USERNAME_MAX = 32;

const codePointsLen = (s = "") => [...s].length;

// proste sprawdzenie emaila
const emailRegex = /^\S+@\S+\.\S+$/;
// nazwa użytkownika (alnum oraz . _ -) + długość
const usernameRegex = new RegExp(
  `^[a-zA-Z0-9._-]{${USERNAME_MIN},${USERNAME_MAX}}$`
);

// ✅ UŻYWAMY .trim() ZAMIAST .transform(...)
const schema = z.object({
  identifier: z
    .string({ required_error: "Email lub nazwa użytkownika jest wymagana" })
    .trim()
    .min(1, "Email lub nazwa użytkownika jest wymagana")
    .max(EMAIL_MAX, `Wartość nie może być dłuższa niż ${EMAIL_MAX} znaków`)
    .refine(
      (v) => emailRegex.test(v) || usernameRegex.test(v),
      "Podaj poprawny email lub nazwę użytkownika"
    ),
  password: z
    .string({ required_error: "Hasło jest wymagane" })
    .refine(
      (v) => codePointsLen(v) >= PASSWORD_MIN,
      `Hasło musi mieć minimum ${PASSWORD_MIN} znaków`
    )
    .refine(
      (v) => codePointsLen(v) <= PASSWORD_MAX,
      `Hasło nie może być dłuższe niż ${PASSWORD_MAX} znaków`
    ),
});

const LoginPage = () => {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      identifier: "alex.johnson@email.com",
      password: "password123",
    },
  });

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const onSubmit = async (data) => {
    try {
      // Backend powinien akceptować email LUB username w pierwszym parametrze
      const result = await login(data.identifier, data.password);

      if (!result?.success) {
        setError("root", {
          type: "server",
          message: result?.error || "Błąd logowania",
        });
        return;
      }

      navigate("/profile");
    } catch (e) {
      console.error(e);
      setError("root", {
        type: "server",
        message: "Wystąpił błąd podczas logowania",
      });
    }
  };

  return (
    <div className="h-[100dvh] bg-gray-50 grid place-items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2B2628] mb-2">
            Zaloguj się
          </h1>
          <p className="text-gray-600">Wprowadź swoje dane, aby kontynuować</p>
        </div>

        <Card>
          <Card.Content>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              {errors.root?.message && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.root.message}
                </div>
              )}

              <Controller
                name="identifier"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Email lub nazwa użytkownika"
                    name="identifier"
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.identifier?.message}
                    required
                    autoComplete="username"
                    placeholder="np. jan.kowalski lub jan.kowalski@example.com"
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Hasło"
                    name="password"
                    type="password"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.password?.message}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logowanie..." : "Zaloguj się"}
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
      </div>
    </div>
  );
};

export default LoginPage;
