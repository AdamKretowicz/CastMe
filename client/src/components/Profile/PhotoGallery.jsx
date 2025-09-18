import React from "react";

export default function PhotoGallery({ photos }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-xl font-semibold text-[#2B2628] mb-4">Galeria zdjęć</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, idx) => (
          <div key={photo.id || idx} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
            <img src={photo.url} alt={photo.originalFileName || `Photo ${idx+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}
