// src/components/Casting/Organizer/ParticipantsModal.jsx
import { useEffect, useState } from "react";
import Modal from "../../UI/Modal";
import Button from "../../UI/Button";
import { apiFetch, getPhotoUrl } from "../../../utils/api";

async function fetchParticipants(castingId) {
  return apiFetch(`/casting/casting/participants/${castingId}`, {
    method: "GET",
  });
}
async function fetchProfile(userId) {
  return apiFetch(`/user/profile/${userId}`, { method: "GET" });
}
async function deleteParticipant(castingId, userId) {
  return apiFetch(`/casting/casting/${castingId}/participant/${userId}`, {
    method: "DELETE",
  });
}

const normalizeUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return getPhotoUrl(pathOrUrl);
};

// ⬅⬅⬅ PROFIL PO ID
const buildProfileUrl = (userId /* string */) => `/profile/${userId}`;

const toInitials = (first, last) =>
  [first?.[0], last?.[0]].filter(Boolean).join("").toUpperCase() || "?";

export default function ParticipantsModal({
  casting,
  isOpen,
  onClose,
  onChanged,
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]); // [{ userId, label, profile, avatarUrl }]
  const [error, setError] = useState(null);
  const [busyIds, setBusyIds] = useState(new Set());

  useEffect(() => {
    if (!isOpen || !casting?.id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchParticipants(casting.id);
        const map = res?.participants || {};
        const userIds = Object.keys(map);

        const enriched = await Promise.all(
          userIds.map(async (uid) => {
            try {
              const profile = await fetchProfile(uid);
              const photos = Array.isArray(profile?.photos)
                ? profile.photos
                : [];
              const main = photos.find((p) => p?.isMain) ?? photos[0] ?? null;
              const avatarUrl = normalizeUrl(main?.url);

              return {
                userId: uid,
                label: map[uid] ?? "",
                profile,
                avatarUrl,
              };
            } catch {
              return {
                userId: uid,
                label: map[uid] ?? "",
                profile: null,
                avatarUrl: null,
              };
            }
          })
        );

        setRows(enriched);
      } catch (e) {
        setError(
          e?.status === 401 || e?.status === 403
            ? "Brak uprawnień do podglądu uczestników."
            : "Nie udało się pobrać uczestników."
        );
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, casting?.id]);

  const onRemove = async (userId) => {
    if (!confirm("Na pewno usunąć tego uczestnika z castingu?")) return;
    setBusyIds((s) => new Set([...s, userId]));
    const prev = rows;
    setRows((r) => r.filter((x) => x.userId !== userId));
    try {
      await deleteParticipant(casting.id, userId);
      onChanged?.({ type: "removed", userId });
    } catch {
      alert("Nie udało się usunąć uczestnika.");
      setRows(prev);
    } finally {
      setBusyIds((s) => {
        const n = new Set(s);
        n.delete(userId);
        return n;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="px-6 py-5">
        <h3 className="text-lg font-semibold text-[#2B2628] mb-3">
          Uczestnicy: {casting?.title || ""}
        </h3>

        {loading && <div>Ładowanie...</div>}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="text-gray-600">Brak uczestników.</div>
        )}

        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
          {rows.map((r) => {
            const firstName = r.profile?.firstName || "";
            const lastName = r.profile?.lastName || "";
            const userName = r.profile?.userName || ""; // z Swaggera: userName (CamelCase)
            const fullName =
              [firstName, lastName].filter(Boolean).join(" ") ||
              userName ||
              r.userId;
            const handle = userName ? `@${userName}` : "—";
            const initials = toInitials(firstName, lastName);
            const profileUrl = buildProfileUrl(r.userId); // ⬅ link po ID

            return (
              <div
                key={r.userId}
                className="flex items-center justify-between border rounded-md px-3 py-2"
              >
                <a
                  href={profileUrl}
                  className="flex items-center gap-3 min-w-0"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                    {r.avatarUrl ? (
                      <img
                        src={r.avatarUrl}
                        alt={`${fullName} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{initials}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{fullName}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {handle}
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-3">
                  {!!r.label && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {r.label}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyIds.has(r.userId)}
                    onClick={() => onRemove(r.userId)}
                  >
                    Usuń
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </div>
    </Modal>
  );
}
