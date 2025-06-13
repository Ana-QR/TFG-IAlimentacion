import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const Sidebar = ({ isOpen, onHistorialActualizado }) => {
  const [productos, setProductos] = useState([]);
  const token = localStorage.getItem('token');

  const cargarHistorial = async () => {
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/api/historial', {
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
    const res = await fetch("http://localhost:3001/api/historial/remove", {
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

    // Elimina localmente tras éxito
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
          className="w-full md:w-64 bg-primaryStrong p-4 flex flex-col z-20 relative md:static md:top-0"
        >
          <Link
            to="/recetas"
            className="mt-2 px-4 py-2 bg-sweetPink text-background rounded-lg hover:bg-opacity-70 transition-colors text-center md:text-left"
          >
            Ver recetas
          </Link>

          <h3 className="mt-4 py-2 text-sm font-semibold mb-2 text-gray-200 border-b border-white/20">
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
