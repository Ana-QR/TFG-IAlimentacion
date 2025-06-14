import { useEffect, useState } from 'react';
import {
  FiPlus, FiTrash2, FiCheck, FiInfo, FiArrowRight, FiRefreshCcw, FiXCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useHistorial } from '../context/HistorialContext';

const ListaCompra = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [listaId, setListaId] = useState(null);
  const [mensajeIA, setMensajeIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'error' });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/items`;
  const cargarHistorial = useHistorial();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.length > 0 && data[0].detalles) {
          setItems(data[0].detalles);
          setListaId(data[0].id_lista);
          localStorage.setItem('id_lista', data[0].id_lista);
        } else {
          setItems([]);
          setListaId(null);
          localStorage.removeItem('id_lista');
        }
      })
      .catch(err => console.error('Error al cargar productos:', err));
  }, [token]);

  const addItem = async () => {
    if (!newItem.trim()) return;
    if (!token) {
      mostrarPopup('Debes iniciar sesión para añadir productos.');
      return;
    }

    try {
      const res = await fetch(
        listaId ? `${API_URL}/lista/${listaId}/item` : `${API_URL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombreLista: listaId ? undefined : 'Mi primera lista',
            nombreProducto: newItem,
            cantidad: 1,
          }),
          credentials: 'include'
        }
      );

      if (!res.ok) {
        console.error('Error en la API:', res.status, await res.text());
        return;
      }

      const data = await res.json();
      if (!listaId && data.id_lista) {
        setListaId(data.id_lista);
        setItems(data.detalles);
      } else {
        setItems(prev => [...prev, { ...data, producto: { nombre: newItem }, completed: false }]);
      }

      setNewItem('');
    } catch (error) {
      console.error('Error al añadir producto:', error);
    }
  };

  const añadirProductoAlHistorial = async (nombreProducto) => {
    if (!token) {
      mostrarPopup('Debes iniciar sesión para guardar productos.');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/historial/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombreProducto }),
        credentials: 'include'
      });

      if (!res.ok) {
        console.error('Error al guardar producto en historial:', await res.text());
        return;
      }

      if (cargarHistorial) cargarHistorial();
    } catch (err) {
      console.error('Error al guardar producto en historial:', err);
    }
  };

  const toggleItem = async (id, currentState) => {
    setItems(items.map(item =>
      item.id_detalle === id ? { ...item, completed: !item.completed } : item
    ));

    try {
      await fetch(`${API_URL}/toggle/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !currentState }),
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error al actualizar estado del producto:', err);
    }
  };

  const deleteItem = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      setItems(items.filter(item => item.id_detalle !== id));
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
  };

  const generarMensajeIA = async () => {
    if (!items.length || !listaId || !token) return;
    setCargandoIA(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ia/mensaje-recomendacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_lista: listaId }),
        credentials: 'include'
      });

      const data = await res.json();
      if (data.mensaje) {
        setMensajeIA(data.mensaje);
      } else {
        setMensajeIA('No se pudo generar la recomendación IA.');
      }
    } catch (err) {
      setMensajeIA('Error al conectar con la IA.');
    } finally {
      setCargandoIA(false);
    }
  };

  const mostrarPopup = (message, type = 'error') => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ visible: false, message: '', type: 'error' }), 3000);
  };

  return (
  <div className="flex-1 max-w-7xl 2xl:max-w-screen-xl mx-auto py-8 px-4 xl:px-8 space-y-8">
    <div className="bg-gradient-to-br from-gray-100 to-white shadow-lg rounded-3xl p-6 md:p-8 space-y-6 border border-gray-300 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <img src="/logoIAlimentacion.png" alt="Icono Lista" className="w-8 h-8" />
        <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-serif font-semibold text-primary">
          Tu Lista de la Compra
        </h1>
      </div>
      <p className="text-gray-600 text-sm sm:text-base xl:text-lg">
        Añade productos y obtén recomendaciones personalizadas con inteligencia artificial.
      </p>

      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={item.id_detalle ?? `temp-${index}`}
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg transition-shadow ${
                item.completed ? 'bg-white/50' : 'bg-white'
              } hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleItem(item.id_detalle)}
                  className={`w-6 h-6 flex items-center justify-center rounded ${
                    item.completed ? 'bg-primary text-white' : 'border border-support bg-white'
                  }`}
                >
                  {item.completed && <FiCheck size={16} />}
                </button>
                <span
                  className={`text-text break-all ${
                    item.completed ? 'line-through text-support' : ''
                  }`}
                >
                  {item.producto.nombre}
                </span>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  onClick={() => añadirProductoAlHistorial(item.producto.nombre)}
                  className="text-green-500 hover:text-green-700"
                >
                  <FiPlus size={16} />
                </button>
                <button
                  onClick={() => deleteItem(item.id_detalle)}
                  className="p-2 hover:text-danger rounded-full transition"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">
            Añade productos a tu lista y guárdalos para generar recetas.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Ej: Arroz integral"
          className="flex-1 input"
        />
        <button
          onClick={addItem}
          className="bg-sweetPink hover:bg-opacity-70 transition-colors text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center text-sm"
        >
          <FiPlus /> Añadir
        </button>
      </div>
    </div>

    <div className="bg-white border-l-4 border-tertiary p-5 rounded-xl shadow-sm space-y-4">
      <h3 className="font-semibold text-tertiary flex items-center gap-2 text-base sm:text-lg">
        <FiInfo size={20} /> Recomendación de IA
      </h3>

      {cargandoIA ? (
        <p className="animate-pulse text-sm text-gray-500">Generando recomendación...</p>
      ) : (
        <p className="text-text text-sm whitespace-pre-line">
          {mensajeIA || 'Pulsa el botón para generar una recomendación.'}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={generarMensajeIA}
          className="btn btn-primary text-sm flex items-center gap-2 justify-center"
        >
          <FiRefreshCcw size={16} /> Generar Recomendación IA
        </button>

        <Link
          to="/recomendaciones"
          className="btn btn-secondary text-sm flex items-center gap-2 justify-center"
        >
          Ver detalles completos <FiArrowRight size={16} />
        </Link>
      </div>
    </div>

    {popup.visible && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
        <div className={`bg-white border rounded-2xl p-6 max-w-md w-full mx-auto text-center animate-bounce-in ${
            popup.type === 'success'
              ? 'border-white'
              : popup.type === 'error'
                ? 'border-danger'
                : 'border-warning'
          }`}>
          <div className="flex flex-col items-center space-y-4">
            {popup.type === 'success' ? (
              <FiCheck size={48} className="text-primaryStrong animate-pop" />
            ) : popup.type === 'error' ? (
              <FiXCircle size={48} className="text-danger animate-pop" />
            ) : (
              <FiInfo size={48} className="text-warning animate-pop" />
            )}
            <h2 className={`text-xl font-semibold ${popup.type === 'success' ? 'text-primary' : popup.type === 'error' ? 'text-danger' : 'text-warning'}`}>
              {popup.type === 'success' ? '¡Éxito!' : popup.type === 'error' ? '¡Error!' : '¡Atención!'}
            </h2>
            <p className="text-sm text-text">{popup.message}</p>
            {popup.secondary && <p className="text-xs text-tertiary">{popup.secondary}</p>}
            <p className="text-xs xl:text-sm text-tertiary">
              {popup.type === 'success'
                ? 'Este mensaje se cerrará automáticamente.'
                : ''}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default ListaCompra;
