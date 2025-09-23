import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Camera, User, Home, Info, Mail, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import Logo from "../../assets/LOGO.svg";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // timeout do łagodnego zamykania dropdownów na hover
  const hoverTimeout = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // reset dropdownów przy zmianie zalogowanego użytkownika
  useEffect(() => {
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }, [currentUser]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    logout();
    navigate("/");
  };

  // linki środkowe
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

  const isLarge = windowWidth >= 1024; // lg breakpoint

  // --- Stylowanie CTA Logowanie/Rejestracja ---
  const activeBtn =
    "inline-flex items-center justify-center rounded-lg bg-[#EA1A62] text-white transition-colors px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-[#d1185a]";
  const inactiveBtn =
    "inline-flex items-center justify-center rounded-lg text-gray-600 transition-colors px-2.5 py-1 text-sm sm:px-3 sm:py-2 sm:text-base hover:text-[#EA1A62]";

  const onLoginPage = location.pathname.startsWith("/login");
  const loginBtnClass = onLoginPage ? activeBtn : inactiveBtn;
  const registerBtnClass = onLoginPage ? inactiveBtn : activeBtn;

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              className="w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[280px] max-w-full"
              src={Logo}
              alt="logo"
            />
          </Link>

          {/* Środek: na desktopie pełna nawigacja */}
          <div className="flex-1 hidden lg:flex justify-center">
            <nav className="flex space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive
                      ? "px-3 h-10 flex items-center gap-x-2 rounded-md whitespace-nowrap transition-colors bg-[#EA1A62] text-white"
                      : "px-3 h-10 flex items-center gap-x-2 rounded-md whitespace-nowrap transition-colors text-gray-600 hover:text-[#EA1A62]"
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Prawa strona */}
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
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                  setUserMenuOpen(true);
                  setMoreMenuOpen(false); // zamknij Więcej, jeśli otwarte
                }}
                onMouseLeave={() => {
                  hoverTimeout.current = setTimeout(() => {
                    setUserMenuOpen(false);
                  }, 200);
                }}
              >
                <button className="text-gray-600 hover:text-[#EA1A62]">
                  <User className="w-6 h-6" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[140px]">
                    <Link
                      to={`/profile/${currentUser.id}`}
                      className="px-4 py-2 hover:bg-gray-100 text-gray-600"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-left"
                    >
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE: wyśrodkowany przycisk „Więcej” */}
          {!isLarge && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="relative pointer-events-auto"
                onMouseEnter={() => {
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                  setMoreMenuOpen(true);
                  setUserMenuOpen(false); // zamknij User, jeśli otwarte
                }}
                onMouseLeave={() => {
                  hoverTimeout.current = setTimeout(() => {
                    setMoreMenuOpen(false);
                  }, 200);
                }}
              >
                <button
                  className="flex items-center gap-x-1 px-3 h-10 rounded-md text-gray-600 hover:text-[#EA1A62] cursor-pointer"
                  onClick={() => {
                    setMoreMenuOpen((v) => {
                      const newState = !v;
                      if (newState) setUserMenuOpen(false); // klik otwiera Więcej i zamyka User
                      return newState;
                    });
                  }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>Więcej</span>
                </button>

                {moreMenuOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[140px]">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreMenuOpen(false)}
                        className="px-4 py-2 hover:bg-gray-100 flex items-center gap-x-2 whitespace-nowrap"
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
