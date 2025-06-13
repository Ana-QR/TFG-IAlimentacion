import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import Logo from '/logoIAlimentacion.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar, isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegistroPage = location.pathname === '/registro';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username') || '';
    setIsLoggedIn(!!token);
    setUsername(user);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('id_lista');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
  };

  return (
    <header className="bg-primary shadow-sm relative z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Izquierda: Botón sidebar o menú hamburguesa */}
        {!isRegistroPage && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded text-background hover:bg-white/10 transition md:block hidden"
            title="Mostrar/Ocultar historial"
          >
            {isOpen ? <FiChevronLeft size={22} /> : <FiChevronRight size={22} />}
          </button>
        )}

        {/* Logo centrado (móvil y escritorio) */}
        <Link to="/" className="flex flex-col items-center justify-center mx-auto">
          <img src={Logo} alt="Logo" className="h-12" />
          <span className="text-xs font-semibold uppercase text-background tracking-widest mt-1">
            IAlimentación
          </span>
        </Link>

        {/* Derecha: sesión / usuario */}
        {!isRegistroPage && (
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center text-white hover:text-background transition"
                >
                  <FiUser size={20} />
                  <span className="ml-1 text-sm">{username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-sweetPink text-background rounded-full hover:bg-opacity-70"
                  title="Cerrar sesión"
                >
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/registro">
                  <button className="px-4 py-2 bg-sweetPink text-background rounded-lg hover:bg-opacity-70 transition-colors">
                    Iniciar Sesión
                  </button>
                </Link>
                <div className="flex items-center space-x-2 opacity-70 text-background">
                  <FiUser size={20} />
                  <span className="text-sm">Invitado</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Móvil: menú hamburguesa (si no es la página de registro) */}
        {!isRegistroPage && (
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-background p-2 rounded hover:bg-white/10"
            >
              <FiMenu size={22} />
            </button>
            {menuOpen && (
              <div className="absolute right-4 top-20 bg-white shadow-lg rounded-lg z-50 p-4 space-y-3 min-w-[180px]">
                {isLoggedIn ? (
                  <>
                    <Link to="/perfil" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary">
                      <FiUser /> {username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm text-danger hover:underline"
                    >
                      <FiLogOut /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/registro">
                      <button className="w-full text-sm text-center bg-sweetPink text-white rounded-lg py-2 hover:bg-opacity-80">
                        Iniciar Sesión
                      </button>
                    </Link>
                    <div className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                      <FiUser /> Invitado
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
