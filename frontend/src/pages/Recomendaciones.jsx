import React, { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from 'react-icons/fi';

const Recomendaciones = () => {
  const [productos, setProductos] = useState([]);
  const [porPrecio, setPorPrecio] = useState([]);
  const [porNutricion, setPorNutricion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modoIA, setModoIA] = useState('hibrido');
  const [popup, setPopup] = useState({ visible: false, type: '', message: '', secondary: '' });

  const token = localStorage.getItem('token');
  const idLista = localStorage.getItem('id_lista');

  useEffect(() => {
    if (!idLista || !token) {
      setProductos([]);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/items/lista/${idLista}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((lista) => {
        const nombres = (lista.detalles || []).map((d) => d.producto.nombre);
        setProductos(nombres);
      })
      .catch((err) => {
        console.error('Error al obtener productos de lista:', err);
        setProductos([]);
      });
  }, [idLista, token]);

  useEffect(() => {
    if (!idLista || !token) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/recomendaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ id_lista: parseInt(idLista) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPorPrecio(data.supermercadosPrecio || []);
        setPorNutricion(data.supermercadosNutricion || []);
      })
      .catch((err) => {
        console.error('Error al obtener recomendaciones básicas:', err);
      });
  }, [idLista, token]);

  useEffect(() => {
    if (!token || productos.length === 0) return;
    setLoading(true);

    const fetchIA = async (preferencias) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recomendaciones/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ productos, preferencias, modo: modoIA }),
      });

      const data = await res.json();

      if (data.fallback) {
        setPopup({
          visible: true,
          type: 'warning',
          message: 'Gemini no estaba disponible.',
          secondary: 'Se ha usado OpenAI (GPT-3.5-turbo), que puede implicar costes.',
        });
        setTimeout(() => setPopup({ visible: false }), 3000);
      }

      return data.recomendacion;
    };

    Promise.all([
      fetchIA('mejor relación calidad-precio'),
      fetchIA('mejor valoración nutricional'),
    ])
      .then(([iaPrecio, iaNutri]) => {
        setPorPrecio(productos.map((p) => {
          const item = iaPrecio?.find((r) => r.producto === p);
          return item ? { supermercado: item.supermercado, precio: item.precio } : null;
        }));
        setPorNutricion(productos.map((p) => {
          const item = iaNutri?.find((r) => r.producto === p);
          return item ? { supermercado: item.supermercado, precio: item.precio } : null;
        }));
      })
      .catch((err) => {
        console.error('Error IA recomendaciones:', err);
        setPopup({
          visible: true,
          type: 'error',
          message: 'No se pudieron generar recomendaciones.',
          secondary: 'Verifica tu conexión o intenta más tarde.',
        });
        setTimeout(() => setPopup({ visible: false }), 3000);
      })
      .finally(() => setLoading(false));
  }, [productos, token, modoIA]);

  return (
    <div className="flex-1 w-full max-w-5xl xl:max-w-6xl 2xl:max-w-screen-xl mx-auto py-8 xl:py-12 px-4 xl:px-10 space-y-10">
      <div className="flex flex-col items-center space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl xl:text-4xl font-serif text-primary flex items-center gap-2">
          Recomendaciones de Supermercado
        </h1>
        <p className="text-sm sm:text-base xl:text-lg text-gray-500">
          Generadas en función de tu lista de compra
        </p>
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-300">
          <label htmlFor="modo" className="text-sm xl:text-base text-gray-600">Modo IA:</label>
          <select
            id="modo"
            value={modoIA}
            onChange={(e) => setModoIA(e.target.value)}
            className="text-sm xl:text-base text-gray-800 bg-transparent focus:outline-none"
          >
            <option value="hibrido">Híbrido (Gemini → OpenAI)</option>
            <option value="gemini">Solo Gemini</option>
          </select>
        </div>
      </div>

      {/* Precio */}
      <div className="bg-gradient-to-br from-gray-100 to-white shadow-lg rounded-3xl p-6 md:p-8 xl:p-10 space-y-6 border border-gray-300 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl xl:text-3xl font-serif text-secondaryDark">
            Mejor supermercado por precio
          </h2>
          {loading && <FiRefreshCw className="animate-spin text-secondaryDark" size={24} />}
        </div>

        <div className="space-y-4">
          {productos.map((p, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-sweetPink rounded-full" />
                <span className="font-medium text-gray-800 text-sm xl:text-base">{p}</span>
              </div>
              <div className="flex flex-col sm:items-end text-sm xl:text-base text-gray-700 font-semibold">
                <span>{porPrecio[i]?.supermercado || '—'}</span>
                <span className="text-sm text-gray-500">{porPrecio[i]?.precio || ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrición */}
      <div className="bg-gradient-to-br from-gray-100 to-white shadow-lg rounded-3xl p-6 md:p-8 xl:p-10 space-y-6 border border-gray-300 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl xl:text-3xl font-serif text-tertiaryDark">
            Mejor supermercado por valoración nutricional
          </h2>
          {loading && <FiRefreshCw className="animate-spin text-tertiaryDark" size={24} />}
        </div>

        <div className="space-y-4">
          {productos.map((p, i) => (
            <div key={`${i}-nutri`} className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primaryStrong rounded-full" />
                <span className="font-medium text-gray-800 text-sm xl:text-base">{p}</span>
              </div>
              <div className="flex flex-col sm:items-end text-sm xl:text-base text-gray-700 font-semibold">
                <span>{porNutricion[i]?.supermercado || '—'}</span>
                <span className="text-sm text-gray-500">{porNutricion[i]?.precio || ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Popup */}
      {popup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className={`bg-white border rounded-2xl p-6 max-w-md w-full mx-auto text-center animate-bounce-in
          ${popup.type === 'success'
              ? 'border-white'
              : popup.type === 'error'
                ? 'border-danger'
                : 'border-warning'
            }`}>
            <div className="flex flex-col items-center space-y-4">
              {popup.type === 'success' ? (
                <FiCheckCircle size={48} className="text-primaryStrong animate-pop" />
              ) : popup.type === 'error' ? (
                <FiXCircle size={48} className="text-danger animate-pop" />
              ) : (
                <FiAlertTriangle size={48} className="text-warning animate-pop" />
              )}
              <h2 className={`text-xl xl:text-2xl font-serif font-semibold ${popup.type === 'success'
                  ? 'text-primary'
                  : popup.type === 'error'
                    ? 'text-danger'
                    : 'text-warning'
                }`}>
                {popup.type === 'success'
                  ? '¡Éxito!'
                  : popup.type === 'error'
                    ? '¡Error!'
                    : '¡Atención!'}
              </h2>
              <p className="text-sm xl:text-base text-text">{popup.message}</p>
              {popup.secondary && (
                <p className="text-xs xl:text-sm text-tertiary">{popup.secondary}</p>
              )}
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

export default Recomendaciones;
