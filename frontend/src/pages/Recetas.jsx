import React, { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Recetas = () => {
  const [recetas, setRecetas] = useState([]);
  const [modoIA, setModoIA] = useState('hibrido');
  const [popup, setPopup] = useState({ visible: false, type: '', message: '', secondary: '' });
  const token = localStorage.getItem('token');

  const cargarRecetas = () => {
    fetch('http://localhost:3001/api/recetas/desde-historial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ modo: modoIA }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error generando recetas.');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data.recetas)) {
          setRecetas(data.recetas);

          if (data.modelo === 'openai') {
            setPopup({
              visible: true,
              type: 'warning',
              message: 'Gemini no estaba disponible.',
              secondary: 'Se ha usado OpenAI (GPT-3.5-turbo), que puede implicar costes.',
            });
            setTimeout(() => setPopup({ visible: false }), 3000);
          }
        } else {
          setRecetas([]);
        }
      })
      .catch(err => {
        console.error('Error al generar recetas:', err);
        setPopup({
          visible: true,
          type: 'error',
          message: 'No se pudieron generar recetas.',
          secondary: 'Verifica tu conexión o intenta más tarde.',
        });
        setTimeout(() => setPopup({ visible: false }), 3000);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setRecetas([]); // Limpiar recetas si no hay sesión
      return;
    }
    cargarRecetas();
  }, [location?.pathname]); // Importante: cambia si navega o cambia usuario


  return (
    <section className="max-w-5xl mx-auto pt-4 pb-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Botón de recarga */}
        <button
          className="flex items-center gap-2 text-sm text-primary font-medium hover:text-tertiary transition"
          onClick={cargarRecetas}
        >
          <FiRefreshCw size={18} /> Generar recetas
        </button>

        {/* Contenedor del modo IA: ahora 100% responsive */}
        <div className="w-full sm:w-fit">
          <div className="bg-white border border-gray-300 rounded-xl shadow-sm px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label htmlFor="modo" className="text-sm text-gray-600 whitespace-nowrap">Modo IA:</label>
            <select
              id="modo"
              value={modoIA}
              onChange={(e) => setModoIA(e.target.value)}
              className="text-sm text-gray-800 bg-transparent focus:outline-none w-full sm:w-auto"
            >
              <option value="hibrido">Híbrido (Gemini → OpenAI)</option>
              <option value="gemini">Solo Gemini</option>
              <option value="openai">Solo OpenAI</option>
            </select>
          </div>
        </div>
      </div>



      {recetas.length > 0 ? (
        <div className="space-y-6">
          {recetas.map((receta, index) => (
            <motion.div
              key={`${receta.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white shadow-md rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-full md:w-40 h-40 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500 overflow-hidden">
                <img
                  src="/recetasDeCocina.png"
                  alt="Receta"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold text-primary font-serif">{receta.title}</h2>
                <p className="text-text text-sm">{receta.description}</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {receta.ingredients?.map((ing, idx) => (
                    <li key={`ing-${idx}`}>{ing}</li>
                  ))}
                </ul>
                <ol className="list-decimal list-inside text-sm text-gray-700">
                  {receta.steps?.map((step, idx) => (
                    <li key={`step-${idx}`}>{step}</li>
                  ))}
                </ol>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No hay recetas generadas aún.</p>
      )}

      {popup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className={`bg-white border rounded-2xl p-8 w-full max-w-md mx-auto text-center animate-bounce-in ${popup.type === 'success'
              ? 'border-white'
              : popup.type === 'error'
                ? 'border-danger'
                : 'border-warning'
              }`}
          >
            <div className="flex flex-col items-center space-y-4">
              {popup.type === 'success' ? (
                <FiCheckCircle size={48} className="text-primaryStrong animate-pop" />
              ) : popup.type === 'error' ? (
                <FiXCircle size={48} className="text-danger animate-pop" />
              ) : (
                <FiAlertTriangle size={48} className="text-warning animate-pop" />
              )}
              <h2
                className={`text-2xl font-serif font-semibold ${popup.type === 'success'
                  ? 'text-primary'
                  : popup.type === 'error'
                    ? 'text-danger'
                    : 'text-warning'
                  }`}
              >
                {popup.type === 'success'
                  ? '¡Éxito!'
                  : popup.type === 'error'
                    ? '¡Error!'
                    : '¡Atención!'}
              </h2>
              <p className="text-base text-text">{popup.message}</p>
              {popup.secondary && <p className="text-sm text-tertiary">{popup.secondary}</p>}
              <p className="text-sm text-tertiary">Este mensaje se cerrará en 3 segundos.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Recetas;