export const castings = [
  {
    id: 1,
    title: "Sesja zdjęciowa dla marki odzieżowej",
    description:
      "Poszukujemy modeli i modelek do sesji zdjęciowej dla nowej kolekcji letniej. Sesja odbędzie się w studio fotograficznym oraz na zewnątrz.",
    location: "Warszawa",
    salary: "500-800 PLN",
    tags: ["fashion", "studio", "outdoor"],
    roles: ["Model"],
    maxPlaces: 4,
    organizerId: 3,
    status: "active",
    createdAt: new Date("2024-12-01"),
    deadline: new Date("2024-12-30"),
  },
  {
    id: 2,
    title: "Kampania reklamowa produktów kosmetycznych",
    description:
      "Casting do kampanii reklamowej luksusowych produktów kosmetycznych. Poszukujemy osób o naturalnej urodzie.",
    location: "Kraków",
    salary: "1000-1500 PLN",
    tags: ["beauty", "commercial", "luxury"],
    roles: ["Model", "Fotograf"],
    maxPlaces: 2,
    organizerId: 3,
    status: "active",
    createdAt: new Date("2024-11-28"),
    deadline: new Date("2024-12-25"),
  },
  {
    id: 3,
    title: "Pokaz mody - projektant debiutant",
    description:
      "Młody projektant szuka modeli do swojego debiutanckiego pokazu podczas Fashion Week.",
    location: "Gdańsk",
    salary: "Do uzgodnienia",
    tags: ["runway", "fashion week", "debut"],
    roles: ["Model", "Projektant"],
    maxPlaces: 6,
    organizerId: 3,
    status: "active",
    createdAt: new Date("2024-11-25"),
    deadline: new Date("2024-12-20"),
  },
];

export const applications = [
  {
    id: 1,
    castingId: 1,
    userId: 1,
    status: "pending",
    appliedAt: new Date("2024-12-02"),
    message:
      "Bardzo jestem zainteresowana tą sesją. Mam doświadczenie w fotografii fashion.",
  },
  {
    id: 2,
    castingId: 2,
    userId: 1,
    status: "accepted",
    appliedAt: new Date("2024-11-29"),
    message: "Posiadam doświadczenie w kampaniach kosmetycznych.",
  },
];
