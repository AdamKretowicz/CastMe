import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Camera, User, Home, Info, Mail, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import Logo from "../../assets/LOGO.svg";

/** Simple media query hook (no SSR crashes) */
function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    // modern browsers
    mq.addEventListener?.("change", onChange);
    // fallback
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
    } else {
      setOpen(false);
    }
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
        // return focus to trigger
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

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // responsive breakpoint (Tailwind lg = 1024px)
  const isLarge = useMediaQuery("(min-width: 1024px)");

  // menus
  const userMenu = useMenu();
  const moreMenu = useMenu();

  // reset dropdowns when auth changes
  useEffect(() => {
    userMenu.closeNow();
    moreMenu.closeNow();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    userMenu.closeNow();
    moreMenu.closeNow();
    await Promise.resolve(logout?.()); // in case logout is async
    navigate("/");
  };

  // links
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
      icon: <Info className="w-4 h-4" />,
    },
  ];

  const navLinks = currentUser ? userLinks : guestLinks;

  // CTA styling
  const activeBtn =
    "inline-flex items-center justify-center rounded-lg bg-[#EA1A62] text-white transition-colors px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-[#d1185a] focus:outline-none focus:ring-2 focus:ring-[#EA1A62]/40";
  const inactiveBtn =
    "inline-flex items-center justify-center rounded-lg text-gray-600 transition-colors px-2.5 py-1 text-sm sm:px-3 sm:py-2 sm:text-base hover:text-[#EA1A62] focus:outline-none focus:ring-2 focus:ring-[#EA1A62]/20";

  const onLoginPage = location.pathname === "/login";
  const loginBtnClass = onLoginPage ? activeBtn : inactiveBtn;
  const registerBtnClass = onLoginPage ? inactiveBtn : activeBtn;

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#EA1A62]/30 rounded"
          >
            <img
              className="w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[280px] max-w-full"
              src={Logo}
              alt="Logo"
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
                    " px-3 h-10 flex items-center gap-x-2 rounded-md whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[#EA1A62]/20"
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
                  if (isLarge) {
                    userMenu.openNow();
                    moreMenu.closeNow();
                  }
                }}
                onMouseLeave={() => {
                  if (isLarge) userMenu.closeNow(150);
                }}
              >
                <button
                  ref={userMenu.btnRef}
                  type="button"
                  className="text-gray-600 hover:text-[#EA1A62] p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#EA1A62]/30"
                  aria-haspopup="menu"
                  aria-expanded={userMenu.open}
                  aria-controls="user-menu"
                  onClick={() => {
                    userMenu.setOpen((v) => {
                      const next = !v;
                      if (next) moreMenu.closeNow();
                      return next;
                    });
                  }}
                >
                  <User className="w-6 h-6" aria-hidden="true" />
                  <span className="sr-only">Otwórz menu użytkownika</span>
                </button>

                {userMenu.open && (
                  <div
                    id="user-menu"
                    ref={userMenu.menuRef}
                    role="menu"
                    aria-label="Menu użytkownika"
                    className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[160px] py-1"
                  >
                    <Link
                      to={`/profile/${currentUser.id}`}
                      role="menuitem"
                      className="px-4 py-2 hover:bg-gray-100 text-gray-700 focus:bg-gray-100 focus:outline-none"
                      onClick={() => userMenu.closeNow()}
                    >
                      Profil
                    </Link>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-left focus:bg-gray-100 focus:outline-none"
                    >
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE: centered “Więcej” */}
          {!isLarge && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="relative pointer-events-auto"
                onMouseEnter={() => {
                  // hover only on larger touchpads; still safe on small screens
                  moreMenu.openNow();
                  userMenu.closeNow();
                }}
                onMouseLeave={() => moreMenu.closeNow(150)}
              >
                <button
                  ref={moreMenu.btnRef}
                  type="button"
                  className="flex items-center gap-x-1 px-3 h-10 rounded-md text-gray-600 hover:text-[#EA1A62] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EA1A62]/20"
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
                          "px-4 py-2 hover:bg-gray-100 flex items-center gap-x-2 whitespace-nowrap text-gray-700 focus:bg-gray-100 focus:outline-none"
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
