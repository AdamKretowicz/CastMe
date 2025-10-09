// src/components/UI/ConfirmModal.jsx
import React from "react";
import Button from "./Button";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
          >
            Anuluj
          </Button>
          <Button onClick={onConfirm} className="#ea1a62 #ea1a62 text-white">
            Potwierdź
          </Button>
        </div>
      </div>
    </div>
  );
}
