import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { HistorialContext } from '../../context/HistorialContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [cargarHistorial, setCargarHistorial] = useState(null);

  // Ocultar sidebar solo en /registro
  const hideSidebar = location.pathname === '/registro';

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const actualizarHistorial = useCallback((fn) => {
    setCargarHistorial(() => fn);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onToggleSidebar={handleToggleSidebar} isOpen={isOpen} />

      <div className="flex flex-col md:flex-row flex-1">
        {!hideSidebar && (
          <Sidebar
            isOpen={isOpen}
            onHistorialActualizado={actualizarHistorial}
            currentPath={location.pathname} // 👈 para saber si estás en /lista
          />
        )}

        <HistorialContext.Provider value={cargarHistorial}>
          <main className="flex-1 bg-background p-4">
            {children}
          </main>
        </HistorialContext.Provider>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
