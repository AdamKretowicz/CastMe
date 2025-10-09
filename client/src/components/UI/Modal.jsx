// src/components/UI/Modal.jsx
import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export default function Modal({
  isOpen,
  backdropImage,
  onClose,
  children,
  /** klik na tło zamyka modal */
  closeOnOverlayClick = true,
  /** rozmiar panelu, np. "w-[96vw] max-w-4xl" */
  panelClassName = "",
  /** pokaż krzyżyk w prawym górnym rogu */
  showCloseButton = true,
}) {
  const panelRef = useRef(null);
  useFocusTrap(isOpen, panelRef, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onMouseDown={(e) => {
        if (!closeOnOverlayClick) return;
        // jeśli klik nie był w panelu → zamknij
        if (panelRef.current && !panelRef.current.contains(e.target)) {
          onClose?.();
        }
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0" aria-hidden>
        {backdropImage && (
          <div
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

      {/* panel (zatrzymujemy propagację, by klik w środku nie zamknął modala) */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()}
          className={[
            "bg-white rounded-2xl w-full shadow-xl ring-1 ring-black/5 outline-none",
            panelClassName || "max-w-md",
          ].join(" ")}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
              aria-label="Zamknij"
              title="Zamknij"
            >
              ✕
            </button>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
