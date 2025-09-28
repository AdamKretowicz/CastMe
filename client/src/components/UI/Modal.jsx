import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export default function Modal({ isOpen, backdropImage, onClose, children }) {
  const ref = useRef(null);
  useFocusTrap(isOpen, ref, onClose);

  if (!isOpen) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* tło */}
      <div className="absolute inset-0">
        {backdropImage && (
          <div
            aria-hidden
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${backdropImage})`,
              filter: "blur(22px)",
              transform: "scale(1.12)",
              opacity: 0.5,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* panel */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div
          ref={ref}
          className="bg-white rounded-2xl w-full max-w-md shadow-xl ring-1 ring-black/5 outline-none"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
