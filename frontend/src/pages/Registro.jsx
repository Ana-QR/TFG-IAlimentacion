import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion';


const Registro = () => {
  const [modo, setModo] = useState('inicio')
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmar: '',
    mantenerSesion: false,
  })
  const [errores, setErrores] = useState({})
  const [popup, setPopup] = useState({
    visible: false,
    message: '',
    type: 'success',
    secondary: ''
  })
  const navigate = useNavigate()

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    setFormulario(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrores(errors => ({ ...errors, [name]: '' }))
  }

  const validar = () => {
    const err = {}
    if (!/\S+@\S+\.\S+/.test(formulario.email)) err.email = 'Email inválido'
    if (formulario.contraseña.length < 6) err.contraseña = 'La contraseña debe tener al menos 6 caracteres'
    if (modo === 'registro' && formulario.contraseña !== formulario.confirmar) err.confirmar = 'Las contraseñas no coinciden'
    if (modo === 'registro' && formulario.nombre.trim() === '') err.nombre = 'El nombre es obligatorio'
    return err
  }

  const mostrarPopup = ({ message, type, secondary = '' }) => {
    setPopup({ visible: true, message, type, secondary })
    setTimeout(() => setPopup(p => ({ ...p, visible: false })), 3000)
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setPopup({ visible: false, message: '', type: 'success', secondary: '' })
    const erroresValid = validar()
    if (Object.keys(erroresValid).length) {
      setErrores(erroresValid)
      return
    }

    try {
      let res, successMessage
      if (modo === 'inicio') {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          email: formulario.email,
          password: formulario.contraseña
        })
        successMessage = `Bienvenid@, ${res.data.user.nombre}`
      } else {
        res = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/registro', {
          nombre: formulario.nombre,
          email: formulario.email,
          password: formulario.contraseña
        })
        successMessage = 'Registro exitoso. Ya puedes iniciar sesión.'
        setModo('inicio')
      }

      // Guarda el token
      localStorage.setItem('token', res.data.token);

      // Llama a /me para obtener el usuario real autenticado
      try {
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });

        const user = userResponse.data;
        localStorage.setItem('username', user.nombre);
      } catch (err) {
        console.error('Error al cargar los datos del usuario:', err);
      }


      const avisoSec = formulario.mantenerSesion
        ? ''
        : 'Aviso: Tu sesión no se mantendrá iniciada después de cerrar el navegador.'

      mostrarPopup({ message: successMessage, type: 'success', secondary: avisoSec })
      setTimeout(() => navigate('/'), 3000)

      setFormulario({ nombre: '', email: '', contraseña: '', confirmar: '', mantenerSesion: false })
      setErrores({})
    } catch (error) {
      console.error('Error en autenticación:', error)
      const serverMsg = error.response?.data?.error || 'Ocurrió un error. Inténtalo de nuevo.'
      mostrarPopup({ message: serverMsg, type: 'error' })
    }
  }

  // Nueva función para recuperar contraseña
  const recuperarContraseña = async () => {
    if (!formulario.email || !/\S+@\S+\.\S+/.test(formulario.email)) {
      mostrarPopup({
        message: 'Por favor, introduce un correo electrónico válido.',
        type: 'warning'
      });
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, // ✅ Ruta corregida
        { email: formulario.email }
      );

      mostrarPopup({
        message: 'Se ha enviado una nueva contraseña a tu correo.',
        type: 'success'
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo enviar la nueva contraseña.';
      mostrarPopup({
        message: msg,
        type: 'error'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
      {/* Botones modo */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            setModo('inicio');
            setErrores({});
            setPopup({ visible: false, message: '', type: 'success', secondary: '' });
          }}
          className={`flex-1 text-sm py-2 rounded-t-xl font-semibold transition ${modo === 'inicio' ? 'bg-sweetPink text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => {
            setModo('registro');
            setErrores({});
            setPopup({ visible: false, message: '', type: 'success', secondary: '' });
          }}
          className={`flex-1 text-sm py-2 rounded-t-xl font-semibold transition ${modo === 'registro' ? 'bg-sweetPink text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
        >
          Registrarse
        </button>
      </div>

      {/* Formulario */}
      <AnimatePresence mode="wait">
        <motion.form
          key={modo}
          onSubmit={manejarEnvio}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-md rounded-b-2xl border border-gray-200 px-6 py-8 space-y-5"
        >
          {modo === 'registro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                className="w-full input rounded-lg"
                placeholder="Tu nombre"
              />
              {errores.nombre && <p className="text-red-600 text-sm">{errores.nombre}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              name="email"
              type="email"
              value={formulario.email}
              onChange={manejarCambio}
              className="w-full input rounded-lg"
              placeholder="ejemplo@correo.com"
            />
            {errores.email && <p className="text-red-600 text-sm">{errores.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              name="contraseña"
              type="password"
              value={formulario.contraseña}
              onChange={manejarCambio}
              className="w-full input rounded-lg"
              placeholder="••••••••"
            />
            {errores.contraseña && <p className="text-red-600 text-sm">{errores.contraseña}</p>}
            {modo === 'inicio' && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={recuperarContraseña}
                  tabIndex={-1}
                >
                  He olvidado mi contraseña
                </button>
              </div>
            )}
          </div>

          {modo === 'registro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                name="confirmar"
                type="password"
                value={formulario.confirmar}
                onChange={manejarCambio}
                className="w-full input rounded-lg"
                placeholder="••••••••"
              />
              {errores.confirmar && <p className="text-red-600 text-sm">{errores.confirmar}</p>}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="mantenerSesion"
              name="mantenerSesion"
              type="checkbox"
              checked={formulario.mantenerSesion}
              onChange={manejarCambio}
              className="h-4 w-4 rounded"
            />
            <label htmlFor="mantenerSesion" className="text-sm text-gray-700">
              Mantener sesión iniciada (cookies)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primaryDark transition"
          >
            {modo === 'inicio' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </motion.form>
      </AnimatePresence>


      {/* Popup de respuesta */}
      {popup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div
            className={`bg-white border rounded-2xl p-6 max-w-md w-full mx-auto text-center animate-bounce-in ${popup.type === 'success'
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
              <h2 className={`text-xl font-serif font-semibold ${popup.type === 'success'
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
              <p className="text-sm text-text">{popup.message}</p>
              {popup.secondary && <p className="text-sm text-tertiary">{popup.secondary}</p>}
              <p className="text-xs text-tertiary">
                {popup.type === 'success'
                  ? 'Serás redirigido en 3 segundos...'
                  : 'Este mensaje se cerrará automáticamente.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

}

export default Registro
