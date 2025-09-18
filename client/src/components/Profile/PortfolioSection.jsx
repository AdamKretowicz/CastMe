import React from "react";

export default function PortfolioSection({ photos }) {
  if (!photos || photos.length <= 1) return null;

  const portfolioPhotos = photos.slice(1); // pomijamy główne zdjęcie

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-xl font-semibold text-[#2B2628] mb-4">Portfolio</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {portfolioPhotos.map((photo, idx) => (
          <div key={photo.id || idx} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
            <img src={photo.url} alt={photo.originalFileName || `Portfolio ${idx+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}
