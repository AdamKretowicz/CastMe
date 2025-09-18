export interface Photo {
  id: string;
  url: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  isMain: boolean;
  order: number;
  createdAtUtc: string;
}

export interface Experience {
  id: string;
  projectName: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
  link: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  email: string;
  country: string;
  city: string;
  gender: number;
  height: number;
  weight: number;
  hairColor: string;
  clothingSize: string;
  description: string;
  role: string;
  photos: Photo[];
  experiences: Experience[];
}
