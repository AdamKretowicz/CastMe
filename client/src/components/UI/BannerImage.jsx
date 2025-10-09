import React from "react";
import { ImageOff } from "lucide-react";

export const BannerImage = ({ src, alt = "", className = "" }) => {
  if (!src) {
    return (
      <div
        className={`relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400 text-sm">Brak bannera</span>
      </div>
    );
  }
  return (
    <div
      className={`relative w-full aspect-[16/9] rounded-lg overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${src})`,
          filter: "blur(16px)",
          transform: "scale(1.1)",
          opacity: 0.45,
        }}
      />
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

export const BannerPlaceholder = ({ text = "Casting bez bannera" }) => (
  <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center">
    <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
    <span className="text-gray-500 text-sm">{text}</span>
  </div>
);
