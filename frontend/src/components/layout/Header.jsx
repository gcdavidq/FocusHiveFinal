import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const GUEST_LINKS = [
  { name: 'Métodos', href: '/metodos-estudio' },
  { name: 'Conócenos', href: '/sobre-nosotros' },
  { name: 'Contáctanos', href: '/contactanos' },
];

const USER_LINKS = [
  { name: 'Métodos', href: '/metodos-estudio' },
  { name: 'Mi progreso', href: '/seguimiento' },
  { name: 'Calendario', href: '/calendario' },
  { name: 'Mis flashcards', href: '/mis-flashcards' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const links = isAuthenticated ? USER_LINKS : GUEST_LINKS;

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `font-medium transition-colors duration-200 ${isActive ? 'text-blue-300' : 'text-white hover:text-blue-300'}`;

  return (
    <header className="bg-[#1e3a5f] text-white shadow-lg sticky top-0 z-50">
      <nav className="container-custom py-4" aria-label="Principal">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-[#1e3a5f] font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold font-display">FocusHive</span>
          </Link>

          {/* Escritorio */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass}>
                {item.name}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-blue-200 text-sm">Hola, {user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-white hover:text-blue-300 font-medium transition-colors">
                  Inicia sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-white text-[#1e3a5f] px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Regístrate gratis
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden p-2 rounded-lg hover:bg-[#2a4a6f] transition-colors duration-200"
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Móvil */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#2a4a6f] pt-4 animate-slide-down">
            <div className="flex flex-col space-y-4">
              {links.map((item) => (
                <NavLink key={item.href} to={item.href} className={linkClass} onClick={() => setIsMenuOpen(false)}>
                  {item.name}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="bg-white/10 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 text-center flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión ({user?.username})
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-white font-medium" onClick={() => setIsMenuOpen(false)}>
                    Inicia sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="bg-white text-[#1e3a5f] px-6 py-2.5 rounded-lg font-semibold text-center shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Regístrate gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
