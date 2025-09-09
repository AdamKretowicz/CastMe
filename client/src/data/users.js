export const users = [
  {
    id: 1,
    firstName: "Anna",
    lastName: "Kowalska",
    email: "anna.kowalska@email.com",
    password: "password123",
    role: "Model",
    age: 24,
    location: "Warszawa",
    height: "172 cm",
    experience: "3 lata doświadczenia w modelingu",
    photos: [
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    ],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    firstName: "Tomasz",
    lastName: "Nowak",
    email: "tomasz.nowak@email.com",
    password: "password123",
    role: "Fotograf",
    age: 32,
    location: "Kraków",
    experience: "8 lat w fotografii fashion",
    photos: [
      "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg",
    ],
    createdAt: new Date("2024-01-10"),
  },
  {
    id: 3,
    firstName: "Organizator",
    lastName: "Test",
    email: "organizer@test.com",
    password: "password123",
    role: "Organizator",
    createdAt: new Date("2024-01-01"),
  },
];

export const favorites = [{ organizerId: 3, userId: 1 }];
