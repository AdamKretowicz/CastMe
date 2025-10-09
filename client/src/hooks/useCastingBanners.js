import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const STORAGE_KEY = "castingBannerUrls";

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};
const writeCache = (obj) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
};

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof window !== "undefined" ? window.location.origin : "");

const toAbsoluteUrl = (u) => {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

export function useCastingBanners(castings) {
  const [banners, setBanners] = useState({});

  // preload cache
  useEffect(() => {
    setBanners((p) => ({ ...readCache(), ...p }));
  }, []);
  // persist
  useEffect(() => {
    writeCache(banners);
  }, [banners]);

  const fetchBannerFor = useCallback(async (castingId) => {
    if (!castingId) return;
    try {
      const res = await apiFetch(`/casting/casting/${castingId}/banner`, {
        method: "GET",
      });
      const absUrl = toAbsoluteUrl(res?.url);
      setBanners((prev) => {
        const next = { ...prev, [castingId]: absUrl || null };
        writeCache(next);
        return next;
      });
    } catch {
      setBanners((prev) => {
        const next = { ...prev, [castingId]: null };
        writeCache(next);
        return next;
      });
    }
  }, []);

  // hydrate inline + fetch missing
  useEffect(() => {
    if (!Array.isArray(castings) || !castings.length) return;

    setBanners((prev) => {
      const next = { ...prev };
      castings.forEach((c) => {
        const inlineUrl =
          c.bannerUrl || c.banner?.url || c.bannerPath || c.banner;
        if (inlineUrl && next[c.id] == null)
          next[c.id] = toAbsoluteUrl(inlineUrl);
      });
      return next;
    });

    const missing = castings
      .map((c) => c.id)
      .filter((id) => id && typeof banners[id] === "undefined");

    if (missing.length)
      Promise.allSettled(missing.map(fetchBannerFor)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castings, fetchBannerFor]);

  return { banners, fetchBannerFor };
}
