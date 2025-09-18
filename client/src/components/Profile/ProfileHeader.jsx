import React from "react";
import { User } from "lucide-react";

export default function ProfileHeader({ profile }) {
  const mainPhoto = profile.photos?.find(p => p.isMain)?.url;

  return (
    <div className="flex flex-col md:flex-row items-center bg-white rounded-xl p-6 shadow-md">
      <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
        {mainPhoto ? (
          <img src={mainPhoto} alt={`${profile.firstName} ${profile.lastName}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="mt-4 md:mt-0 md:ml-6 flex-1">
        <h1 className="text-3xl font-bold text-[#2B2628]">{profile.firstName} {profile.lastName}</h1>
        <p className="text-sm text-gray-500 mt-1">{profile.role}</p>
        <p className="text-gray-600 mt-2">{profile.city}, {profile.country}</p>
      </div>
    </div>
  );
}
