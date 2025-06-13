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

  const hideSidebar = location.pathname === '/registro';

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const actualizarHistorial = useCallback((fn) => {
    setCargarHistorial(() => fn);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Si quieres el navbar fijo, activa estas dos líneas: */}
      {/* <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md"> */}
      <Navbar onToggleSidebar={handleToggleSidebar} isOpen={isOpen} />
      {/* </div> */}

      <div className="flex flex-col md:flex-row flex-1">
        {!hideSidebar && (
          <Sidebar isOpen={isOpen} onHistorialActualizado={actualizarHistorial} />
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
