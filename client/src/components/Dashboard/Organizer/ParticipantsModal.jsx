// src/components/Casting/Organizer/ParticipantsModal.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Modal from "../../UI/Modal";
import Button from "../../UI/Button";
import { apiFetch, getPhotoUrl } from "../../../utils/api";

/* -------------------- utils -------------------- */

const toAbs = (u) => (!u ? null : /^https?:\/\//i.test(u) ? u : getPhotoUrl(u));
const initials = (f, l) =>
  [f?.[0], l?.[0]].filter(Boolean).join("").toUpperCase() || "?";
const profileHref = (id) => `/profile/${id}`;

const roleMapPL = {
  Model: "Model",
  Photographer: "Fotograf",
  Designer: "Projektant",
  Volunteer: "Wolontariusz",
};

function pickAvatarFromUser(u) {
  if (!u || typeof u !== "object") return null;

  const mp = u?.mainPhoto;
  if (mp?.url || mp?.relativeUrl || mp?.filePath) {
    return toAbs(mp.url || mp.relativeUrl || mp.filePath);
  }

  const photos = Array.isArray(u?.photos) ? u.photos : [];
  if (photos.length) {
    const byMain = photos.find((p) => p?.isMain) || null;
    const byApproved =
      photos.find(
        (p) => p?.isActive || p?.approved || p?.status === "Approved"
      ) || null;
    const first = photos[0] || null;

    const candidate =
      (byMain && (byMain.url || byMain.relativeUrl || byMain.filePath)) ||
      (byApproved &&
        (byApproved.url || byApproved.relativeUrl || byApproved.filePath)) ||
      (first && (first.url || first.relativeUrl || first.filePath)) ||
      null;
    return toAbs(candidate);
  }

  return toAbs(
    u?.avatarUrl ||
      u?.photoUrl ||
      u?.mainPhotoUrl ||
      u?.profilePicturePath ||
      null
  );
}

/* -------------------- API helpers -------------------- */

// Wszyscy użytkownicy danego castingu
async function fetchAllUsers(castingId) {
  try {
    const res = await apiFetch(`/casting/casting/${castingId}/all-users`, {
      method: "GET",
    });

    if (Array.isArray(res)) return res; // starszy format
    if (Array.isArray(res?.users)) return res.users; // nowy format
    return [];
  } catch (e) {
    const status = e?.status ?? e?.response?.status ?? null;
    if (status === 404) return [];
    throw e;
  }
}

// Zmiana statusu – backend wymaga query paramu "AssignmentStatus"
async function updateAssignmentStatus(assignmentId, status) {
  const s = String(status || "").toLowerCase(); // TryParse z ignoreCase → ok
  const params = new URLSearchParams({ AssignmentStatus: s });
  await apiFetch(
    `/casting/casting/${assignmentId}/status?${params.toString()}`,
    { method: "POST" }
  );
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/* -------------------- Component -------------------- */

export default function ParticipantsModal({
  casting,
  isOpen,
  onClose,
  onChanged,
}) {
  const castingId = casting?.id;

  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [busy, setBusy] = useState(new Set());

  // Błędy krytyczne z pobierania
  const [error, setError] = useState(null);
  // Lokalny, nieblokujący komunikat (np. limit ról)
  const [notice, setNotice] = useState(null);

  const usersCacheRef = useRef(new Map());
  const fetchToken = useRef(0);
  const noticeTimer = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    []
  );

  const showNotice = useCallback((msg, ms = 3500) => {
    setNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, ms);
  }, []);

  /* ---------- Normalizacje ---------- */

  const readStatus = (row) =>
    row?.assignmentStatus ??
    row?.assigmentStatus ??
    row?.applicationStatus ??
    row?.status ??
    null;

  // staramy się wydobyć nazwę roli z assignmentu; dopiero fallback do user.role
  const readRoleKey = (row) => {
    const fromAssignName =
      row?.role?.name ||
      row?.assignmentRole?.name ||
      row?.assignment?.role?.name ||
      row?.roleName ||
      row?.role;

    const fromUser = row?.user?.role;

    const key = fromAssignName || fromUser || "";
    return typeof key === "string" ? key : String(key ?? "");
  };

  const normalizeUser = (uRaw) => {
    if (!uRaw) return null;
    const avatarUrl =
      pickAvatarFromUser(uRaw) ?? toAbs(uRaw?.avatarUrl ?? null);

    const user = {
      id: uRaw?.id,
      firstName: uRaw?.firstName ?? "",
      lastName: uRaw?.lastName ?? "",
      userName: uRaw?.userName ?? uRaw?.username ?? "",
      avatarUrl,
    };

    if (user.id) usersCacheRef.current.set(user.id, user);
    return user;
  };

  const normalizeFromAllUsers = useCallback((rows) => {
    const pend = [];
    const acc = [];
    const rej = [];

    for (const row of rows || []) {
      const status = String(readStatus(row) || "").toLowerCase(); // pending|active|rejected
      const u = normalizeUser(row?.user);
      const roleKey = readRoleKey(row); // ← ważne: bierzemy z assignment, nie z usera
      const rolePL = roleKey ? roleMapPL[roleKey] ?? roleKey : "";
      const assignmentId = row?.assignmentId ?? row?.id ?? null;

      if (!u?.id) continue;

      const base = {
        roleKey,
        rolePL,
        assignmentId: assignmentId ?? null,
      };

      if (status === "pending") {
        pend.push({ ...base, user: u });
      } else if (status === "active") {
        acc.push({
          ...base,
          userId: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          userName: u.userName,
          avatarUrl: u.avatarUrl,
        });
      } else if (status === "rejected") {
        rej.push({
          ...base,
          userId: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          userName: u.userName,
          avatarUrl: u.avatarUrl,
        });
      }
    }

    const dedupBy = (arr, keyFn) =>
      Array.from(new Map(arr.map((x) => [keyFn(x), x])).values());

    return {
      pending: dedupBy(pend, (x) => x.assignmentId || `uid:${x.user.id}`),
      accepted: dedupBy(acc, (x) => x.userId),
      rejected: dedupBy(rej, (x) => x.userId),
    };
  }, []);

  /* ---------- Pobieranie ---------- */

  const loadAll = useCallback(
    async ({ keepData = true } = {}) => {
      if (!castingId) return;
      const myToken = ++fetchToken.current;

      if (!keepData) {
        setPending([]);
        setAccepted([]);
        setRejected([]);
      }
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchAllUsers(castingId);
        const { pending, accepted, rejected } = normalizeFromAllUsers(rows);

        if (fetchToken.current === myToken) {
          setPending(pending);
          setAccepted(accepted);
          setRejected(rejected);
        }
      } catch (e) {
        if (fetchToken.current !== myToken) return;
        const status = e?.status ?? e?.response?.status ?? null;
        const msg =
          e?.data?.message ||
          e?.response?.data?.message ||
          e?.message ||
          "Wystąpił błąd podczas pobierania uczestników.";
        if (status === 404) {
          setPending([]);
          setAccepted([]);
          setRejected([]);
          setError(null);
        } else {
          setError(status ? `${msg} (HTTP ${status})` : msg);
        }
      } finally {
        if (fetchToken.current === myToken) setLoading(false);
      }
    },
    [castingId, normalizeFromAllUsers]
  );

  useEffect(() => {
    if (!isOpen || !castingId) return;
    loadAll({ keepData: true });
    return () => {
      fetchToken.current++;
      setBusy(new Set());
      setError(null);
      setLoading(false);
      setNotice(null);
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
        noticeTimer.current = null;
      }
    };
  }, [isOpen, castingId, loadAll]);

  /* ---------- Busy wrapper ---------- */

  const withBusy = useCallback(
    (key, fn) =>
      async (...args) => {
        setBusy((s) => new Set([...s, key]));
        try {
          await fn(...args);
        } finally {
          setBusy((s) => {
            const n = new Set(s);
            n.delete(key);
            return n;
          });
        }
      },
    []
  );

  /* ---------- Akcje ---------- */

  // Czy rola osiągnęła limit wg danych z karty castingu + aktualnie zaakceptowanych
  const isRoleFull = useCallback(
    (roleKey) => {
      if (!casting?.roles?.length || !roleKey) return false;
      const roleRow = casting.roles.find(
        (r) => String(r.role) === String(roleKey)
      );
      if (!roleRow || typeof roleRow.capacity !== "number") return false;

      const acceptedInRole = accepted.filter(
        (x) => x.roleKey === roleKey
      ).length;
      return acceptedInRole >= roleRow.capacity;
    },
    [casting?.roles, accepted]
  );

  // PENDING -> ACTIVE
  const approvePending = useCallback(
    (row) =>
      withBusy(row.assignmentId || `uid:${row.user.id}`, async () => {
        if (isRoleFull(row.roleKey)) {
          const pretty =
            row.rolePL || roleMapPL[row.roleKey] || row.roleKey || "Rola";
          showNotice(
            `Maksymalna liczba uczestników dla roli „${pretty}” została osiągnięta.`
          );
          return;
        }

        const prevPending = [...pending];
        const prevAccepted = [...accepted];

        // optimistic
        setPending((list) =>
          list.filter(
            (r) =>
              r.assignmentId !== row.assignmentId && r.user.id !== row.user.id
          )
        );
        setAccepted((list) => {
          const u = row.user;
          const next = [
            ...list,
            {
              userId: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              userName: u.userName,
              avatarUrl: u.avatarUrl,
              roleKey: row.roleKey,
              rolePL: row.rolePL,
              assignmentId: row.assignmentId ?? null,
            },
          ];
          const dedup = new Map(next.map((x) => [x.userId, x]));
          return Array.from(dedup.values());
        });

        try {
          if (!row.assignmentId) throw new Error("Brak assignmentId w danych.");
          await updateAssignmentStatus(row.assignmentId, "active");
          await delay(120);
          await loadAll({ keepData: true });
          onChanged?.({ type: "approved", userId: row.user.id });
        } catch (e) {
          console.error("approvePending failed:", e);
          // komunikat nieblokujący + rollback
          const msg =
            e?.status === 400
              ? "Nie udało się zaakceptować – sprawdź limit ról lub spróbuj ponownie."
              : "Nie udało się zaakceptować użytkownika. Spróbuj ponownie.";
          showNotice(msg);
          setPending(prevPending);
          setAccepted(prevAccepted);
        }
      })(),
    [accepted, pending, loadAll, withBusy, onChanged, isRoleFull, showNotice]
  );

  // PENDING -> REJECTED
  const rejectPending = useCallback(
    (row) =>
      withBusy(row.assignmentId || `uid:${row.user.id}`, async () => {
        const prevPending = [...pending];
        const prevRejected = [...rejected];

        // optimistic
        setPending((list) =>
          list.filter(
            (r) =>
              r.assignmentId !== row.assignmentId && r.user.id !== row.user.id
          )
        );
        setRejected((list) => {
          const u = row.user;
          const next = [
            ...list,
            {
              userId: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              userName: u.userName,
              avatarUrl: u.avatarUrl,
              roleKey: row.roleKey,
              rolePL: row.rolePL,
              assignmentId: row.assignmentId ?? null,
            },
          ];
          const dedup = new Map(next.map((x) => [x.userId, x]));
          return Array.from(dedup.values());
        });

        try {
          if (!row.assignmentId) throw new Error("Brak assignmentId w danych.");
          await updateAssignmentStatus(row.assignmentId, "rejected");
          await delay(120);
          await loadAll({ keepData: true });
          onChanged?.({ type: "rejected", userId: row.user.id });
        } catch (e) {
          console.error("rejectPending failed:", e);
          showNotice("Nie udało się odrzucić użytkownika. Spróbuj ponownie.");
          setPending(prevPending);
          setRejected(prevRejected);
        }
      })(),
    [pending, rejected, loadAll, withBusy, onChanged, showNotice]
  );

  // ACCEPTED -> PENDING
  const removeAccepted = useCallback(
    (r) =>
      withBusy(`acc:${r.userId}`, async () => {
        const prevAccepted = [...accepted];
        const prevPending = [...pending];

        // optimistic
        setAccepted((list) => list.filter((x) => x.userId !== r.userId));
        setPending((list) => {
          const next = [
            ...list,
            {
              assignmentId: r.assignmentId ?? null,
              roleKey: r.roleKey,
              rolePL: r.rolePL,
              user: {
                id: r.userId,
                firstName: r.firstName,
                lastName: r.lastName,
                userName: r.userName,
                avatarUrl: r.avatarUrl,
              },
            },
          ];
          const dedup = new Map(
            next.map((x) => [x.assignmentId || `uid:${x.user.id}`, x])
          );
          return Array.from(dedup.values());
        });

        try {
          if (!r.assignmentId) throw new Error("Brak assignmentId w danych.");
          await updateAssignmentStatus(r.assignmentId, "pending");
          await delay(120);
          await loadAll({ keepData: true });
          onChanged?.({ type: "to-pending", userId: r.userId });
        } catch (e) {
          console.error("removeAccepted failed:", e);
          showNotice(
            "Nie udało się przenieść do oczekujących. Spróbuj ponownie."
          );
          setAccepted(prevAccepted);
          setPending(prevPending);
        }
      })(),
    [accepted, pending, loadAll, withBusy, onChanged, showNotice]
  );

  // REJECTED -> PENDING
  const restoreRejected = useCallback(
    (r) =>
      withBusy(`rej:${r.userId}`, async () => {
        const prevRejected = [...rejected];
        const prevPending = [...pending];

        // optimistic
        setRejected((list) => list.filter((x) => x.userId !== r.userId));
        setPending((list) => {
          const next = [
            ...list,
            {
              assignmentId: r.assignmentId ?? null,
              roleKey: r.roleKey,
              rolePL: r.rolePL,
              user: {
                id: r.userId,
                firstName: r.firstName,
                lastName: r.lastName,
                userName: r.userName,
                avatarUrl: r.avatarUrl,
              },
            },
          ];
          const dedup = new Map(
            next.map((x) => [x.assignmentId || `uid:${x.user.id}`, x])
          );
          return Array.from(dedup.values());
        });

        try {
          if (!r.assignmentId) throw new Error("Brak assignmentId w danych.");
          await updateAssignmentStatus(r.assignmentId, "pending");
          await delay(120);
          await loadAll({ keepData: true });
          onChanged?.({ type: "restore", userId: r.userId });
        } catch (e) {
          console.error("restoreRejected failed:", e);
          showNotice("Nie udało się przywrócić użytkownika.");
          setRejected(prevRejected);
          setPending(prevPending);
        }
      })(),
    [pending, rejected, loadAll, withBusy, onChanged, showNotice]
  );

  /* ---------- Render ---------- */

  function PersonRow({ leftUser, roleText, right }) {
    const fullName =
      [leftUser.firstName, leftUser.lastName].filter(Boolean).join(" ") ||
      leftUser.userName ||
      leftUser.id;
    const handle = leftUser.userName ? `@${leftUser.userName}` : "—";

    return (
      <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-white">
        <a
          href={leftUser.id ? profileHref(leftUser.id) : "#"}
          className="flex items-center gap-3 min-w-0"
          target="_blank"
          rel="noreferrer"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
            {leftUser.avatarUrl ? (
              <img
                src={leftUser.avatarUrl}
                alt={`${fullName} avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-600">
                {initials(leftUser.firstName, leftUser.lastName)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{fullName}</div>
            <div className="text-sm text-gray-600 truncate">{handle}</div>
            {!!roleText && (
              <div className="mt-0.5">
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                  {roleText}
                </span>
              </div>
            )}
          </div>
        </a>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    );
  }

  const pendingList = useMemo(() => {
    return pending.map((row) => {
      const user = row.user;
      const busyKey = row.assignmentId || `uid:${user.id}`;
      const disabled = busy.has(busyKey);
      return (
        <PersonRow
          key={row.assignmentId || `pending-${user.id}`}
          leftUser={user}
          roleText={row.rolePL}
          right={
            <>
              <button
                disabled={disabled}
                onClick={() => approvePending(row)}
                className="px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Dodaj
              </button>
              <button
                disabled={disabled}
                onClick={() => rejectPending(row)}
                className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                Odrzuć
              </button>
            </>
          }
        />
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, busy]);

  const acceptedList = useMemo(() => {
    return accepted.map((r) => {
      const key = `acc:${r.userId}`;
      const disabled = busy.has(key);
      const user = {
        id: r.userId,
        firstName: r.firstName,
        lastName: r.lastName,
        userName: r.userName,
        avatarUrl: r.avatarUrl,
      };
      return (
        <PersonRow
          key={r.userId}
          leftUser={user}
          roleText={r.rolePL}
          right={
            <button
              disabled={disabled}
              onClick={() => removeAccepted(r)}
              className="px-3 py-1 rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
              Przenieś do oczekujących
            </button>
          }
        />
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted, busy]);

  const rejectedList = useMemo(() => {
    return rejected.map((r) => {
      const key = `rej:${r.userId}`;
      const disabled = busy.has(key);
      const user = {
        id: r.userId,
        firstName: r.firstName,
        lastName: r.lastName,
        userName: r.userName,
        avatarUrl: r.avatarUrl,
      };
      return (
        <PersonRow
          key={`rej-${r.userId}`}
          leftUser={user}
          roleText={r.rolePL}
          right={
            <button
              disabled={disabled}
              onClick={() => restoreRejected(r)}
              className="px-3 py-1 rounded-md text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
            >
              Przywróć do oczekujących
            </button>
          }
        />
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rejected, busy]);

  const showEmpty =
    !loading &&
    !error &&
    pending.length === 0 &&
    accepted.length === 0 &&
    rejected.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick
      showCloseButton
      panelClassName="w-[96vw] max-w-4xl"
    >
      <div className="px-6 py-5">
        <h3 className="text-lg sm:text-xl font-semibold text-[#2B2628] mb-4 pr-10">
          Uczestnicy: {casting?.title || ""}
        </h3>

        {/* NIEBLOKUJĄCY BANER */}
        {notice && (
          <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 flex items-start justify-between">
            <span className="pr-3">{notice}</span>
            <button
              onClick={() => setNotice(null)}
              className="ml-3 shrink-0 rounded px-2 py-0.5 text-amber-900 hover:bg-amber-100"
              aria-label="Zamknij komunikat"
            >
              ×
            </button>
          </div>
        )}

        {/* Krytyczny błąd pobrania */}
        {error && <div className="text-red-600 mb-3">{error}</div>}

        {showEmpty && !error && (
          <div className="text-gray-600">Brak zgłoszeń.</div>
        )}

        {!error && !showEmpty && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {/* Oczekujący */}
            <section className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-3">
              <h4 className="text-base font-semibold mb-2 text-yellow-900">
                Oczekujący
              </h4>
              <div className="space-y-2">
                {pendingList.length ? (
                  pendingList
                ) : (
                  <div className="text-sm text-yellow-800/80">
                    Brak oczekujących.
                  </div>
                )}
              </div>
            </section>

            {/* Zaakceptowani */}
            <section className="rounded-xl border border-green-200 bg-green-50/60 p-3">
              <h4 className="text-base font-semibold mb-2 text-green-900">
                Zaakceptowani
              </h4>
              <div className="space-y-2">
                {acceptedList.length ? (
                  acceptedList
                ) : (
                  <div className="text-sm text-green-800/80">
                    Brak zaakceptowanych.
                  </div>
                )}
              </div>
            </section>

            {/* Odrzuceni */}
            <section className="rounded-xl border border-red-200 bg-red-50/60 p-3">
              <h4 className="text-base font-semibold mb-2 text-red-900">
                Odrzuceni
              </h4>
              <div className="space-y-2">
                {rejectedList.length ? (
                  rejectedList
                ) : (
                  <div className="text-sm text-red-800/80">
                    Brak odrzuconych.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* (opcjonalny) helper do aplikowania */
export async function applyToCasting(castingId, userId) {
  await apiFetch(`/casting/casting/${castingId}/participant/${userId}`, {
    method: "POST",
  });
}
