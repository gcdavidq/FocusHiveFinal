import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { isAuthenticated, authAPI } from '../../services/api'; // Ajusta la ruta según tu estructura

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsLoggedIn(false);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Limpiar datos locales aunque falle la petición al backend
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  // Menú para usuarios NO autenticados
  const menuItemsGuest = [
    { name: 'Conócenos', href: '/sobre-nosotros' },
    { name: 'Contáctanos', href: '/contactanos' },
    { name: 'Inicia sesión', href: '/login' },
  ];

  // Menú para usuarios autenticados
  const menuItemsAuth = [
    { name: 'Conócenos', href: '/sobre-nosotros' },
    { name: 'Contáctanos', href: '/contactanos' },
    { name: 'Mi Seguimiento', href: '/Seguimiento' }, // Opcional: agregar link al dashboard
  ];

  const menuItems = isLoggedIn ? menuItemsAuth : menuItemsGuest;

  return (
    <header className="bg-[#1e3a5f] text-white shadow-lg sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-[#1e3a5f] font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold font-display">FocusHive</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}

            {/* Botones según estado de autenticación */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            ) : (
              <Link
                to="/registro"
                className="bg-white text-[#1e3a5f] px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Regístrate gratis
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-[#2a4a6f] transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#2a4a6f] pt-4 animate-slide-down">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Botón móvil según estado de autenticación */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 text-center shadow-md flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/registro"
                  className="bg-white text-[#1e3a5f] px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 text-center shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Regístrate gratis
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;