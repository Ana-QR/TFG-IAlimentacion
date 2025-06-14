import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiTrash2, FiShoppingCart, FiBookOpen} from 'react-icons/fi';
import { LuLeaf } from 'react-icons/lu';


const Sidebar = ({ isOpen, onHistorialActualizado }) => {
  const [productos, setProductos] = useState([]);
  const token = localStorage.getItem('token');
  const location = useLocation();

  const cargarHistorial = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Error al cargar historial:', await res.text());
        setProductos([]);
        return;
      }

      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setProductos([]);
    }
  };

  const eliminarProducto = async (nombreProducto) => {
    if (!token) {
      alert("Debes iniciar sesión para borrar productos.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/historial/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombreProducto }),
      });

      if (!res.ok) {
        console.error("Error al borrar producto:", await res.text());
        return;
      }

      setProductos((prev) => prev.filter((p) => p.nombre !== nombreProducto));
    } catch (err) {
      console.error("Error al borrar producto:", err);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [token]);

  useEffect(() => {
    if (typeof onHistorialActualizado === 'function') {
      onHistorialActualizado(cargarHistorial);
    }
  }, [onHistorialActualizado]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full md:w-64 bg-primaryStrong p-4 flex flex-col z-20 relative md:static md:top-0 text-white"
        >
          <nav className="space-y-3 mb-6">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="flex items-center gap-3 text-sm font-medium hover:text-gray-200 transition-colors"
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white">
                  <FiShoppingCart size={16} />
                </span>
                Lista de la Compra
              </Link>
            )}

            <Link
              to="/recomendaciones"
              className="flex items-center gap-3 text-sm font-medium hover:text-gray-200 transition-colors"
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white">
                <LuLeaf size={16} />
              </span>
              Recomendaciones
            </Link>

            <Link
              to="/recetas"
              className="flex items-center gap-3 text-sm font-medium hover:text-gray-200 transition-colors"
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white">
                <FiBookOpen size={16} />
              </span>
              Recetas
            </Link>
          </nav>


          <h3 className="py-2 text-sm font-semibold mb-2 text-gray-200 border-b border-white/20">
            Productos guardados:
          </h3>

          {productos.length === 0 ? (
            <p className="text-xs text-gray-300">No hay productos guardados.</p>
          ) : (
            <ul className="space-y-3 text-gray-100 max-h-60 overflow-y-auto pr-1">
              {productos.map((prod) => (
                <li
                  key={prod.id_producto}
                  className="flex justify-between items-center bg-white px-3 py-2 rounded shadow-sm"
                >
                  <span className="text-xs text-gray-800 break-words">{prod.nombre}</span>
                  <button
                    onClick={() => eliminarProducto(prod.nombre)}
                    className="text-gray-500 hover:text-red-500 transition"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
