// src/components/Casting/Model/CastingCard.jsx
import { Calendar, MapPin } from "lucide-react";
import Button from "../../UI/Button";
import { BannerImage, BannerPlaceholder } from "../../UI/BannerImage";

const roleDisplayMap = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
};

function StatusBadge({ status }) {
  if (!status) return null;
  const s = String(status).toLowerCase();
  const map = {
    pending: { text: "Oczekujące", cls: "bg-yellow-50 text-yellow-800" },
    active: { text: "Zaakceptowano", cls: "bg-green-50 text-green-800" },
    rejected: { text: "Odrzucono", cls: "bg-red-50 text-red-800" },
  };
  const data = map[s] || { text: status, cls: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${data.cls}`}
      title={`Status: ${data.text}`}
    >
      {data.text}
    </span>
  );
}

export default function CastingCard({
  casting,
  bannerUrl,
  hasApplied,
  appliedStatus, // "Pending" | "Active" | "Rejected" | null
  appliedRole, // "Model" | "Photographer" | ...
  disabled, // ogólne wyłączenie (np. po terminie)
  blockedReason, // NOWE: string – gdy nie możesz dołączyć z powodu roli
  onApply,
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="w-full mb-3">
        {bannerUrl ? (
          <BannerImage
            src={bannerUrl}
            alt={`Banner castingu ${casting.title}`}
            className="rounded-lg"
          />
        ) : (
          <BannerPlaceholder />
        )}
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{casting.title}</h3>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {casting.location}
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {casting.eventDate
            ? new Date(casting.eventDate).toLocaleDateString("pl-PL")
            : "-"}
        </div>
      </div>

      {/* Liczniki ról */}
      <div className="flex flex-wrap gap-2 mb-4">
        {casting.roles?.map((role, idx) => {
          const display = roleDisplayMap[role.role] || role.role;
          const accepted = role?.acceptedCount ?? 0;
          const capacity = role?.capacity ?? 0;
          return (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              title={`${display}: ${accepted}/${capacity}`}
            >
              {display} {accepted}/{capacity}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Utworzono:{" "}
          {casting.createdAt
            ? new Date(casting.createdAt).toLocaleDateString("pl-PL")
            : "-"}
        </div>

        {/* prawa kolumna: status / komunikat / przycisk */}
        <div className="flex items-center gap-2">
          {hasApplied ? (
            <>
              {appliedRole ? (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  {roleDisplayMap[appliedRole] || appliedRole}
                </span>
              ) : null}
              <StatusBadge status={appliedStatus} />
            </>
          ) : blockedReason ? (
            <span
              className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 border border-red-200"
              title={blockedReason}
            >
              Nie możesz dołączyć: {blockedReason}
            </span>
          ) : (
            <Button disabled={disabled} onClick={onApply}>
              Zgłoś się
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
