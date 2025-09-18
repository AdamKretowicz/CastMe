import { Link, NavLink, useNavigate } from "react-router-dom";
import { Camera, User, Home, Info, Mail, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { to: "/about", label: "O nas", icon: <Info className="w-4 h-4" /> },
    { to: "/contact", label: "Kontakt", icon: <Mail className="w-4 h-4" /> },
    {
      to: "/castings",
      label: "Castingi",
      icon: <Camera className="w-5 h-5" />,
    },
  ];

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

          {/* Środek - More menu na mobile/medium, wszystkie linki na large */}
          <div className="flex-1 flex justify-center">
            {isLarge ? (
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
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="flex items-center gap-x-1 px-3 h-10 rounded-md text-gray-600 hover:text-[#EA1A62] cursor-pointer
"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>Więcej</span>
                </button>
                {moreMenuOpen && (
                  <div className="absolute mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[120px]">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreMenuOpen(false)}
                        className="px-4 py-2 hover:bg-gray-100 flex items-center gap-x-2"
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

          {/* Prawo - Auth / User */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {!currentUser ? (
              <>
                {/* Zawsze pokaż Logowanie/Rejestracja na medium i large */}
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

                {/* Mobile - ikona usera z dropdown */}
                {isMobile && (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="text-gray-600 hover:text-[#EA1A62]"
                    >
                      <User className="w-6 h-6" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-50 min-w-[120px]">
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
              <div className="flex items-center space-x-4">
                <Link
                  to={`/profile/${currentUser.id}`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#EA1A62]"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {currentUser.firstName}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#EA1A62]"
                >
                  Wyloguj
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
