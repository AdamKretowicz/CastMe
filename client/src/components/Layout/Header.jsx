import { Link, NavLink, useNavigate } from "react-router-dom";
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
import { useState, useEffect, useRef } from "react";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // zamykanie dropdownu po kliknięciu poza
  useEffect(() => {
    const onDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
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
      label: "Panel",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
  ];

  const navLinks = currentUser ? userLinks : guestLinks;

  const isMobile = windowWidth < 768; // sm
  const isLarge = windowWidth >= 1024; // lg

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              className="w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[280px] max-w-full"
              src="src/assets/LOGO.svg"
              alt="logo"
            />
          </Link>

          {/* Nawigacja (środek) */}
          <div className="flex-1 flex justify-center">
            {/* u zalogowanego zawsze widoczne linki (bez „Więcej”) */}
            {isLarge || currentUser ? (
              <nav className="flex space-x-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-3 h-10 flex items-center gap-x-2 rounded-md whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-[#EA1A62] text-white"
                          : "text-gray-600 hover:text-[#EA1A62]"
                      }`
                    }
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMoreMenuOpen((o) => !o)}
                  className="flex items-center gap-x-1 px-3 h-10 rounded-md text-gray-600 hover:text-[#EA1A62]"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>Więcej</span>
                </button>
                {moreMenuOpen && (
                  <div className="absolute mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[160px]">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreMenuOpen(false)}
                        className={({ isActive }) =>
                          `px-4 py-2 flex items-center gap-x-2 hover:bg-gray-100 ${
                            isActive ? "text-[#EA1A62]" : "text-gray-700"
                          }`
                        }
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prawa strona */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {!currentUser ? (
              <>
                {!isMobile && (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-2 rounded-lg text-gray-600 hover:text-[#EA1A62] transition-colors"
                    >
                      Logowanie
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-lg bg-[#EA1A62] text-white hover:bg-[#d1185a] transition-colors"
                    >
                      Rejestracja
                    </Link>
                  </>
                )}
                {isMobile && (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="text-gray-600 hover:text-[#EA1A62]"
                    >
                      <User className="w-6 h-6" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[140px]">
                        <Link
                          to="/login"
                          className="px-4 py-2 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Logowanie
                        </Link>
                        <Link
                          to="/register"
                          className="px-4 py-2 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Rejestracja
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Dropdown zalogowanego: hover + click, bez "dziury" (mt-0)
              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#EA1A62] focus:outline-none"
                >
                  {currentUser?.photos?.length > 0 ? (
                    <img
                      src={currentUser.photos[0]}
                      alt={currentUser.firstName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="hidden sm:inline">
                    {currentUser.firstName}
                  </span>
                </button>

                <div
                  className={`absolute right-0 top-full mt-0 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[180px] transition transform origin-top-right ${
                    userMenuOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <Link
                    to="/profile"
                    className="px-4 py-2 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Wyloguj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
