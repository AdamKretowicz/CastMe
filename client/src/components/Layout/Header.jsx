import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Camera,
  User,
  Home,
  Info,
  Mail,
  MoreHorizontal,
  LayoutDashboard,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import Logo from "../../assets/LOGO.svg";
import { apiFetch, getPhotoUrl } from "../../utils/api";

/** Simple media query hook (no SSR crashes) */
function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;
  const [matches, setMatches] = useState(getMatch);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener?.("change", onChange);
    mq.addListener?.(onChange);
    onChange();
    return () => {
      mq.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange);
    };
  }, [query]);
  return matches;
}

/** Small reusable menu controller */
function useMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const timeoutRef = useRef(null);

  const openNow = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);
  const closeNow = useCallback((delay = 0) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setOpen(false), delay);
    } else setOpen(false);
  }, []);

  // close on click outside
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      const t = e.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        closeNow();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, closeNow]);

  // close on Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        closeNow();
        btnRef.current?.focus();
      }
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeNow]);

  useEffect(
    () => () => timeoutRef.current && clearTimeout(timeoutRef.current),
    []
  );
  return { open, setOpen, openNow, closeNow, menuRef, btnRef };
}

// avatar helpers
const normalizeUrl = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  return getPhotoUrl(p);
};
const toInitials = (f, l) =>
  [f?.[0], l?.[0]].filter(Boolean).join("").toUpperCase() || "";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLarge = useMediaQuery("(min-width: 1024px)");

  const userMenu = useMenu();
  const moreMenu = useMenu();

  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    userMenu.closeNow();
    moreMenu.closeNow();
  }, [currentUser]); // eslint-disable-line

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!currentUser?.id) {
          if (alive) {
            setProfile(null);
            setAvatarUrl(null);
          }
          return;
        }
        const prof = await apiFetch(`/user/profile/${currentUser.id}`, {
          method: "GET",
        });
        if (!alive) return;
        setProfile(prof || null);
        const photos = Array.isArray(prof?.photos) ? prof.photos : [];
        const main = photos.find((p) => p?.isMain) ?? photos[0] ?? null;
        setAvatarUrl(normalizeUrl(main?.url) || null);
      } catch {
        if (alive) {
          setProfile(null);
          setAvatarUrl(null);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentUser?.id]);

  const handleLogout = async () => {
    userMenu.closeNow();
    moreMenu.closeNow();
    await Promise.resolve(logout?.());
    navigate("/");
  };

  const guestLinks = [
    { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { to: "/about", label: "O nas", icon: <Info className="w-4 h-4" /> },
    { to: "/contact", label: "Kontakt", icon: <Mail className="w-4 h-4" /> },
    {
      to: "/castings",
      label: "Castingi",
      icon: <Camera className="w-5 h-5" />,
    },
  ];
  const userLinks = [
    { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];
  const navLinks = currentUser ? userLinks : guestLinks;

  const activeBtn =
    "inline-flex items-center justify-center rounded-lg bg-[#EA1A62] text-white transition-colors px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-[#d1185a]";
  const inactiveBtn =
    "inline-flex items-center justify-center rounded-lg text-gray-600 transition-colors px-2.5 py-1 text-sm sm:px-3 sm:py-2 sm:text-base hover:text-[#EA1A62]";

  const onLoginPage = location.pathname === "/login";
  const loginBtnClass = onLoginPage ? activeBtn : inactiveBtn;
  const registerBtnClass = onLoginPage ? inactiveBtn : activeBtn;

  const initials =
    toInitials(profile?.firstName, profile?.lastName) ||
    (currentUser?.email ? currentUser.email[0]?.toUpperCase() : "");

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo (bez outline/ringu) */}
          <Link
            to="/"
            className="flex-shrink-0 rounded focus:outline-none focus-visible:outline-none"
          >
            <img
              className="w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[280px] max-w-full"
              src={Logo}
              alt="Logo"
              draggable={false}
            />
          </Link>

          {/* Desktop nav */}
          <div className="flex-1 hidden lg:flex justify-center">
            <nav className="flex space-x-4" aria-label="Primary">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    (isActive
                      ? "bg-[#EA1A62] text-white"
                      : "text-gray-600 hover:text-[#EA1A62]") +
                    " px-3 h-10 flex items-center gap-x-2 rounded-md whitespace-nowrap transition-colors"
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {!currentUser ? (
              <>
                <Link
                  to="/login"
                  className={`${loginBtnClass} hidden sm:inline-flex`}
                >
                  Logowanie
                </Link>
                <Link to="/register" className={registerBtnClass}>
                  Rejestracja
                </Link>
              </>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => {
                  userMenu.openNow(); // ← bez isLarge
                  moreMenu.closeNow();
                }}
                onMouseLeave={() => {
                  userMenu.closeNow(150); // ← bez isLarge
                }}
              >
                <button
                  ref={userMenu.btnRef}
                  type="button"
                  className="p-0.5 rounded-full focus:outline-none focus-visible:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={userMenu.open}
                  aria-controls="user-menu"
                  onMouseEnter={() => {
                    // ← bez isLarge
                    userMenu.openNow();
                    moreMenu.closeNow();
                  }}
                  onClick={() => {
                    // zostaw klik jako alternatywę
                    userMenu.setOpen((v) => {
                      const next = !v;
                      if (next) moreMenu.closeNow();
                      return next;
                    });
                  }}
                  title="Otwórz menu użytkownika"
                >
                  {/* Avatar bez ringów */}
                  <span className="inline-flex w-9 h-9 rounded-full overflow-hidden bg-gray-200 items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar użytkownika"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : initials ? (
                      <span className="text-sm font-medium text-gray-700 select-none">
                        {initials}
                      </span>
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </span>
                </button>

                {userMenu.open && (
                  <div
                    id="user-menu"
                    ref={userMenu.menuRef}
                    role="menu"
                    aria-label="Menu użytkownika"
                    className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[180px] py-1"
                    onMouseEnter={() => userMenu.openNow()} // ← bez isLarge
                    onMouseLeave={() => userMenu.closeNow(150)} // ← bez isLarge
                  >
                    <Link
                      to={`/profile/${currentUser.id}`}
                      role="menuitem"
                      className="px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={() => userMenu.closeNow()}
                    >
                      Profil
                    </Link>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-left"
                    >
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE: centered “Więcej” (bez outline/ringu) */}
          {!isLarge && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="relative pointer-events-auto"
                onMouseEnter={() => {
                  moreMenu.openNow();
                  userMenu.closeNow();
                }}
                onMouseLeave={() => moreMenu.closeNow(150)}
              >
                <button
                  ref={moreMenu.btnRef}
                  type="button"
                  className="flex items-center gap-x-1 px-3 h-10 rounded-md text-gray-600 hover:text-[#EA1A62] cursor-pointer focus:outline-none focus-visible:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={moreMenu.open}
                  aria-controls="more-menu"
                  onClick={() =>
                    moreMenu.setOpen((v) => {
                      const next = !v;
                      if (next) userMenu.closeNow();
                      return next;
                    })
                  }
                >
                  <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                  <span>Więcej</span>
                </button>

                {moreMenu.open && (
                  <div
                    id="more-menu"
                    ref={moreMenu.menuRef}
                    role="menu"
                    aria-label="Menu nawigacji"
                    className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[160px] py-1"
                  >
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        role="menuitem"
                        onClick={() => moreMenu.closeNow()}
                        className={({ isActive }) =>
                          (isActive ? "bg-gray-100 " : "") +
                          "px-4 py-2 hover:bg-gray-100 flex items-center gap-x-2 whitespace-nowrap text-gray-700"
                        }
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
