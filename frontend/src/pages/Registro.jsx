import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Registro = () => {
  const [modo, setModo] = useState('inicio');
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmar: '',
    mantenerSesion: false,
  });
  const [errores, setErrores] = useState({});
  const [avisoSesion, setAvisoSesion] = useState('');
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const mostrarPopup = (message, type = 'success') => {
    setPopup({ visible: true, message, type });
    setTimeout(() => {
      setPopup({ visible: false, message: '', type: 'success' });
    }, 3000);
  };

  const validar = () => {
    const err = {};
    if (modo === 'registro') {
      if (!formulario.nombre.trim()) err.nombre = 'Introduce un nombre';
      if (formulario.contraseña !== formulario.confirmar) err.confirmar = 'Las contraseñas no coinciden';
    }
    if (!formulario.email.trim()) err.email = 'Introduce un email';
    if (!formulario.contraseña) err.contraseña = 'Introduce una contraseña';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    const endpoint =
      modo === 'registro'
        ? `${import.meta.env.VITE_API_URL}/api/auth/register`
        : `${import.meta.env.VITE_API_URL}/api/auth/login`;

    try {
      const res = await axios.post(endpoint, {
        nombre: formulario.nombre,
        email: formulario.email,
        contraseña: formulario.contraseña,
      });

      const { token, nombre } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', nombre);
      if (formulario.mantenerSesion) {
        setAvisoSesion('');
      } else {
        setAvisoSesion('Tu sesión no se mantendrá activa al cerrar el navegador.');
      }

      mostrarPopup(
        modo === 'registro'
          ? 'Registro exitoso. ¡Bienvenido!'
          : 'Inicio de sesión exitoso',
        'success'
      );

      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      mostrarPopup(
        error?.response?.data?.error || 'Error en la autenticación',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <form
        onSubmit={manejarEnvio}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-primary">
          {modo === 'registro' ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        {modo === 'registro' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              className="input w-full"
            />
            {errores.nombre && <p className="text-sm text-red-500">{errores.nombre}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            name="email"
            value={formulario.email}
            onChange={manejarCambio}
            className="input w-full"
          />
          {errores.email && <p className="text-sm text-red-500">{errores.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            name="contraseña"
            value={formulario.contraseña}
            onChange={manejarCambio}
            className="input w-full"
          />
          {errores.contraseña && <p className="text-sm text-red-500">{errores.contraseña}</p>}
        </div>

        {modo === 'registro' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input
              type="password"
              name="confirmar"
              value={formulario.confirmar}
              onChange={manejarCambio}
              className="input w-full"
            />
            {errores.confirmar && <p className="text-sm text-red-500">{errores.confirmar}</p>}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="mantenerSesion"
              checked={formulario.mantenerSesion}
              onChange={manejarCambio}
              className="accent-primary"
            />
            <span>Mantener sesión iniciada</span>
          </label>
        </div>

        {avisoSesion && (
          <p className="text-xs text-yellow-500 text-center mt-2">{avisoSesion}</p>
        )}

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primaryDark text-white rounded-lg py-2 font-semibold transition-colors"
        >
          {modo === 'registro' ? 'Registrarse' : 'Entrar'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setModo(modo === 'registro' ? 'inicio' : 'registro')}
            className="text-sm text-primary hover:underline mt-4"
          >
            {modo === 'registro'
              ? '¿Ya tienes una cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </form>

      {popup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white border rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="flex flex-col items-center gap-3">
              {popup.type === 'success' ? (
                <FiCheckCircle size={40} className="text-green-500" />
              ) : (
                <FiXCircle size={40} className="text-red-500" />
              )}
              <p className="text-sm">{popup.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registro;
