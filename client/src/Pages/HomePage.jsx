import { Link } from "react-router-dom";
import { ArrowRight, Users, Camera, Star, Shield } from "lucide-react";
import Button from "../components/UI/Button";

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-[#2B2628] mb-6">
              Znajdź swój wymarzony
              <span className="text-[#EA1A62] block">casting</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Platforma łącząca talenty z możliwościami. Dołącz do tysięcy
              artystów, którzy już znaleźli swoją drogę do sukcesu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg cursor-pointer
"
                >
                  Dołącz teraz
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg self-center cursor-pointer
"
              >
                Dowiedz się więcej
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2B2628] mb-4">
              Dlaczego CastMe?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nowoczesna platforma stworzona z myślą o potrzebach branży
              kreatywnej
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-[#EA1A62] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2628] mb-2">
                Społeczność
              </h3>
              <p className="text-gray-600">
                Dołącz do największej społeczności artystów i organizatorów w
                Polsce
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-[#EA1A62] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2628] mb-2">
                Casting
              </h3>
              <p className="text-gray-600">
                Znajdź idealne projekty dopasowane do Twoich umiejętności i
                zainteresowań
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-[#EA1A62] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2628] mb-2">
                Jakość
              </h3>
              <p className="text-gray-600">
                Wszystkie ogłoszenia są weryfikowane, aby zapewnić najwyższą
                jakość
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-[#EA1A62] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2628] mb-2">
                Bezpieczeństwo
              </h3>
              <p className="text-gray-600">
                Twoje dane są bezpieczne dzięki zaawansowanym systemom ochrony
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#2B2628] mb-2">10k+</div>
              <div className="text-gray-600">Zarejestrowanych artystów</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2B2628] mb-2">500+</div>
              <div className="text-gray-600">Aktywnych castingów</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2B2628] mb-2">95%</div>
              <div className="text-gray-600">Zadowolonych użytkowników</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2B2628] mb-2">24/7</div>
              <div className="text-gray-600">Wsparcie techniczne</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2B2628] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gotowy na nowe wyzwania?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Dołącz do CastMe już dziś i odkryj nowe możliwości w swojej karierze
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="px-8 py-4 text-lg bg-[#EA1A62] hover:bg-[#d1185a] cursor-pointer
"
            >
              Rozpocznij za darmo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
