import { Users, Star, Shield, Camera, Heart, Award } from "lucide-react";
import Card from "../components/UI/Card";

function AboutPage() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Społeczność",
      description:
        "Dołącz do największej społeczności artystów, modeli, fotografów i organizatorów w Polsce.",
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Profesjonalne castingi",
      description:
        "Znajdź wymarzone projekty dopasowane do Twoich umiejętności i zainteresowań.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bezpieczeństwo",
      description:
        "Wszystkie ogłoszenia są weryfikowane, aby zapewnić bezpieczne środowisko pracy.",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Jakość",
      description:
        "Współpracujemy tylko z renomowanymi markami i profesjonalnymi organizatorami.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Wsparcie",
      description:
        "Nasz zespół jest dostępny 24/7, aby pomóc Ci w każdej sytuacji.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Rozwój",
      description:
        "Oferujemy warsztaty, kursy i mentoring dla rozwijających się artystów.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Zarejestrowanych użytkowników" },
    { number: "500+", label: "Aktywnych castingów miesięcznie" },
    { number: "95%", label: "Zadowolonych klientów" },
    { number: "2019", label: "Rok założenia" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#2B2628] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">O CastMe</h1>
            <p className="text-xl text-gray-300 mb-8">
              Jesteśmy platformą, która łączy talenty z możliwościami. Od 2019
              roku pomagamy artystom znajdować wymarzone projekty i
              organizatorom odkrywać nowe talenty.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2B2628] mb-6">
                Nasza misja
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Wierzymy, że każdy talent zasługuje na szansę. CastMe powstało z
                potrzeby stworzenia bezpiecznej, przejrzystej i profesjonalnej
                platformy, gdzie artyści mogą rozwijać swoje kariery, a
                organizatorzy znajdować idealne osoby do swoich projektów.
              </p>
              <p className="text-lg text-gray-600">
                Naszym celem jest demokratyzacja dostępu do branży kreatywnej i
                tworzenie społeczności opartej na wzajemnym szacunku i
                profesjonalizmie.
              </p>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3812944/pexels-photo-3812944.jpeg"
                  alt="Zespół CastMe"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2B2628] mb-4">
              Dlaczego wybierają nas?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Poznaj funkcje i wartości, które wyróżniają CastMe na rynku
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <Card.Content className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#EA1A62] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#FFFFFF]">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#2B2628] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2B2628] mb-4">
              Nasze osiągnięcia
            </h2>
            <p className="text-xl text-gray-600">
              Liczby, które mówią same za siebie
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#EA1A62] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2B2628] mb-4">
              Nasz zespół
            </h2>
            <p className="text-xl text-gray-600">
              Poznaj ludzi stojących za CastMe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Anna Kowalska",
                role: "CEO & Założycielka",
                image:
                  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
                description:
                  "Były model z 10-letnim doświadczeniem w branży fashion.",
              },
              {
                name: "Tomasz Nowak",
                role: "CTO",
                image:
                  "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg",
                description: "Ekspert technologiczny z pasją do innowacji.",
              },
              {
                name: "Magdalena Wiśniewska",
                role: "Head of Operations",
                image:
                  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
                description:
                  "Odpowiada za płynne działanie platformy i wsparcie użytkowników.",
              },
            ].map((member, index) => (
              <Card key={index}>
                <Card.Content className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[#2B2628] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#EA1A62] font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-[#2B2628] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Masz pytania?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Jesteśmy tutaj, aby pomóc. Skontaktuj się z nami w dowolnym
            momencie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:kontakt@castme.pl"
              className="bg-[#EA1A62] text-white px-8 py-3 rounded-lg hover:bg-[#d1185a] transition-colors"
            >
              Napisz do nas
            </a>
            <a
              href="tel:+48123456789"
              className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-[#2B2628] transition-colors"
            >
              Zadzwoń: +48 123 456 789
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
