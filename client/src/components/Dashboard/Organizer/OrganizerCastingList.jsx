// src/components/Dashboard/Organizer/OrganizerCastingList.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../../UI/Card";
import { Calendar, MapPin, Users } from "lucide-react";
import { BannerImage, BannerPlaceholder } from "../../UI/BannerImage";
import { apiFetch } from "../../../utils/api";

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

// pomocniczo: bezpieczne pobranie totalApplicants nawet jeśli backend nie podał wprost
function getTotalFromStats(stats) {
  if (!stats) return null;
  if (typeof stats.totalApplicants === "number") return stats.totalApplicants;
  const p = Number(stats.pending || 0);
  const a = Number(stats.active || 0);
  const r = Number(stats.rejected || 0);
  return p + a + r;
}

function OrganizerCastingCard({
  casting,
  bannerUrl,
  selected,
  onSelect,
  totalApplicantsOverride,
}) {
  // preferuj to co przyszło z listy; fallback do nadpisania z lokalnego fetchu
  const totalApplicants =
    getTotalFromStats(casting?.stats) ??
    (typeof totalApplicantsOverride === "number"
      ? totalApplicantsOverride
      : null) ??
    casting?.totalApplicants ??
    casting?.applicantsCount ??
    0;

  const status = (casting?.status || "Active").toString();
  const statusCfg =
    status === "Active"
      ? { text: "Aktywny", cls: "bg-green-100 text-green-800" }
      : status === "Draft"
      ? { text: "Szkic", cls: "bg-gray-100 text-gray-700" }
      : status === "Closed"
      ? { text: "Zamknięty", cls: "bg-red-100 text-red-800" }
      : { text: status, cls: "bg-gray-100 text-gray-700" };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-selected={selected}
      onClick={() => onSelect(casting)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(casting);
      }}
      className={[
        "border rounded-lg p-4 cursor-pointer transition-colors outline-none",
        "hover:bg-gray-50",
        "focus:ring-2 focus:ring-[#EA1A62] focus:ring-offset-0",
        selected
          ? "border-[#EA1A62] bg-pink-50 ring-2 ring-[#EA1A62]"
          : "border-gray-200",
      ].join(" ")}
    >
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
          {formatDateTime(casting.eventDate)}
        </div>
      </div>

      {/* Liczniki ról */}
      <div className="flex flex-wrap gap-3 mb-2">
        {casting.roles?.map((role, idx) => {
          const roleKey = role?.role;
          const display = roleDisplayMap[roleKey] || roleKey || "Rola";
          const fromRole =
            typeof role?.acceptedCount === "number" ? role.acceptedCount : null;
          const fromStats =
            typeof casting?.stats?.acceptedByRole?.[roleKey] === "number"
              ? casting.stats.acceptedByRole[roleKey]
              : null;
          const accepted = fromRole ?? fromStats ?? 0;
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
        <p className="text-xs text-gray-500">
          Utworzono:{" "}
          {casting.createdAt
            ? new Date(casting.createdAt).toLocaleDateString("pl-PL")
            : "-"}
        </p>

        <div className="flex items-center gap-2">
          {/* Wszyscy kandydaci */}
          <span
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full"
            title={`Wszyscy kandydaci: ${totalApplicants}${
              casting?.stats
                ? ` (P:${casting.stats.pending ?? 0} • A:${
                    casting.stats.active ?? 0
                  } • R:${casting.stats.rejected ?? 0})`
                : ""
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {totalApplicants}
          </span>

          <span className={`px-2 py-1 text-xs rounded-full ${statusCfg.cls}`}>
            {statusCfg.text}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerCastingList({
  castings,
  castingBanners,
  isLoading,
  selectedCastingId,
  onSelectCasting,
}) {
  // lokalny cache totalApplicants gdy backend nie dostarczył statystyk w liście
  const [statsMap, setStatsMap] = useState({}); // { [castingId]: { totalApplicants } }

  // leniwe dociąganie statystyk dla tych castingów, które nie mają stats w liście
  useEffect(() => {
    let alive = true;

    async function fetchMissing() {
      const missing = (castings || [])
        .filter(
          (c) =>
            getTotalFromStats(c?.stats) == null && // nie ma totalApplicants w liście
            statsMap[c.id] == null
        )
        .map((c) => c.id);

      if (!missing.length) return;

      const updates = {};
      for (const id of missing) {
        try {
          const res = await apiFetch(`/casting/casting/${id}/all-users`, {
            method: "GET",
          });
          const total =
            (res?.statistics && Number(res.statistics.totalApplicants)) ||
            (Array.isArray(res) ? res.length : 0);
          updates[id] = { totalApplicants: Number.isFinite(total) ? total : 0 };
        } catch {
          updates[id] = { totalApplicants: 0 };
        }
      }
      if (alive) {
        setStatsMap((prev) => ({ ...prev, ...updates }));
      }
    }

    fetchMissing();
    return () => {
      alive = false;
    };
  }, [castings, statsMap]);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <p className="text-gray-500 text-center py-4">Ładowanie castingów...</p>
      );
    }
    if (!castings?.length) {
      return (
        <p className="text-gray-500 text-center py-4">
          Nie masz jeszcze żadnych castingów
        </p>
      );
    }
    return (
      <div className="space-y-4">
        {castings.map((c) => (
          <OrganizerCastingCard
            key={c.id}
            casting={c}
            bannerUrl={castingBanners[c.id]}
            selected={selectedCastingId === c.id}
            onSelect={onSelectCasting}
            totalApplicantsOverride={statsMap[c.id]?.totalApplicants}
          />
        ))}
      </div>
    );
  }, [
    isLoading,
    castings,
    castingBanners,
    selectedCastingId,
    onSelectCasting,
    statsMap,
  ]);

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-[#2B2628]">Moje castingi</h2>
      </Card.Header>
      <Card.Content>{content}</Card.Content>
    </Card>
  );
}
