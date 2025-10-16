// src/components/Dashboard/Organizer/OrganizerCastingList.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../../UI/Card";
import { Calendar, MapPin, Users } from "lucide-react";
import { BannerImage, BannerPlaceholder } from "../../UI/BannerImage";
import { apiFetch } from "../../../utils/api";
import Modal from "../../UI/Modal";
import Button from "../../UI/Button";
import { useToast } from "../../../context/ToastProvider";

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
  onSelect, // otwiera ParticipantsModal
  totalApplicantsOverride,
  onDeleted, // po udanym DELETE
}) {
  const { show: toast } = useToast();

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

  // Potwierdzenie i stan kasowania
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const openDeleteConfirm = (e) => {
    e?.stopPropagation?.();
    setDeleteError(null);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    // Start usuwania – zamykamy modal od razu, żeby nie blokował scrolla/focusu
    setDeleting(true);
    setDeleteError(null);
    setConfirmOpen(false);
    try {
      await apiFetch(`/casting/casting/${casting.id}`, { method: "DELETE" });
      // trzymaj loader/blur na karcie 1.5s
      setTimeout(() => {
        onDeleted?.(casting); // rodzic zrobi refetch
        toast("Casting usunięty.", "success");
        setDeleting(false); // karta i tak zwykle się odmontuje po refetchu
      }, 1500);
    } catch (err) {
      // Błąd – pokaż modal z komunikatem (przywracamy modal)
      setDeleting(false);
      setDeleteError(err?.message || "Nie udało się usunąć castingu.");
      setConfirmOpen(true);
      toast("Nie udało się usunąć castingu.", "error");
    }
  };

  return (
    <div
      className={[
        "relative",
        "border rounded-lg p-4 transition-colors outline-none",
        "hover:bg-gray-50",
        // ✅ ZAZNACZENIE: bez jasnoczerwonego tła i bez ringa — tylko border
        selected ? "border-[#EA1A62]" : "border-gray-200",
      ].join(" ")}
    >
      {/* KORPUS (klik otwiera ParticipantsModal) */}
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
          deleting ? "blur-[2px] pointer-events-none select-none" : "",
          "cursor-pointer", // ✅ pointer na całym klikalnym obszarze
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

        <h3 className="font-medium text-gray-900 mb-2"> {casting.title} </h3>

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
              typeof role?.acceptedCount === "number"
                ? role.acceptedCount
                : null;
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

      {/* PASEK AKCJI (poza korpusem, nie otwiera ParticipantsModal) */}
      <div className="mt-3 pt-3 flex items-center justify-between">
        {/* ❌ bez border-t */}
        {/* Edytuj – ciemny pomarańcz */}
        <Button
          variant="primary"
          size="sm"
          className="flex items-center bg-amber-600 hover:bg-amber-700"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: logika edycji
          }}
          disabled={deleting}
        >
          Edytuj
        </Button>

        {/* Usuń – czerwony, bez ikonki (spinner tylko w trakcie) */}
        <Button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteConfirm(e);
          }}
          variant="primary"
          size="sm"
          disabled={deleting}
          className="flex items-center bg-red-600 hover:bg-red-700"
        >
          {deleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : null}
          Usuń
        </Button>
      </div>

      {/* Overlay loader podczas usuwania */}
      {deleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-transparent" />
        </div>
      )}

      {/* Modal potwierdzenia */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => (!deleting ? setConfirmOpen(false) : null)}
      >
        <div className="p-5">
          <h4 className="text-lg font-semibold mb-2">Usunąć casting?</h4>
          <p className="text-sm text-gray-600">
            Tytuł: <span className="font-medium">{casting.title}</span>
          </p>
          {deleteError && (
            <div className="mt-3 bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2 text-sm">
              {deleteError}
            </div>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
              className="bg-gray-500 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors"
            >
              Anuluj
            </Button>

            {/* Usuń — czerwony, ze spinnerem w trakcie */}
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors flex items-center"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              Usuń
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function OrganizerCastingList({
  castings,
  castingBanners,
  isLoading,
  selectedCastingId,
  onSelectCasting,
  onAfterDelete, // rodzic: refetchCastings?.()
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
            onDeleted={() => onAfterDelete?.()}
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
    onAfterDelete,
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
