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

// parser: jeśli backend zwróci ISO bez strefy (YYYY-MM-DDTHH:mm:ss), potraktuj jako UTC
const parseApiDate = (val) => {
  if (!val) return null;
  if (
    typeof val === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val)
  ) {
    return new Date(val + "Z");
  }
  return new Date(val);
};

// format daty+godziny w PL (Warszawa)
const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = parseApiDate(iso);
  return d.toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  blockedReason, // string – gdy nie możesz dołączyć z powodu roli
  onApply,
}) {
  const eventDateTime = formatDateTime(casting.eventDate);
  const createdAtDate = casting.createdAt
    ? parseApiDate(casting.createdAt).toLocaleDateString("pl-PL", {
        timeZone: "Europe/Warsaw",
      })
    : "—";

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

      <h3 className="font-medium text-gray-900 mb-1 break-words">
        {casting.title}
      </h3>

      {/* PEŁNY opis z łamaniem długich słów i zachowaniem nowych linii */}
      {casting.description && (
        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          {casting.description}
        </p>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center min-w-0 break-words">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          {casting.location}
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {eventDateTime}
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
        <div className="text-xs text-gray-500">Utworzono: {createdAtDate}</div>

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
