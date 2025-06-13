import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiUser, FiSave } from 'react-icons/fi';

const Perfil = () => {
  const [usuario, setUsuario] = useState({ nombre: '', email: '' });
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    axios
      .get('http://localhost:3001/api/usuario/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsuario(res.data);
        setNuevoNombre(res.data.nombre);
      })
      .catch(() => setMensaje('No se pudo cargar el perfil.'));
  }, [token]);

  const guardarCambios = () => {
    axios
      .put(
        'http://localhost:3001/api/usuario/perfil',
        { nombre: nuevoNombre },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setUsuario((u) => ({ ...u, nombre: nuevoNombre }));
        setMensaje('Perfil actualizado correctamente.');
      })
      .catch(() => setMensaje('Error al actualizar el perfil.'));
  };

  const cambiarContraseña = () => {
    axios
      .put(
        'http://localhost:3001/api/usuario/cambiar-password',
        { contraseñaActual, nuevaContraseña },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => setMensaje('Contraseña actualizada correctamente.'))
      .catch(() => setMensaje('Error al actualizar la contraseña.'));
  };

  const recuperarContraseña = () => {
    axios
      .post(
        'http://localhost:3001/api/usuario/recuperar-password',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => setMensaje('Se ha enviado una nueva contraseña a tu correo.'))
      .catch(() => setMensaje('No se pudo enviar la nueva contraseña.'));
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-serif text-primary flex items-center gap-2">
        <FiUser className="text-primary" /> Perfil de Usuario
      </h1>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
        {/* Datos del perfil */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={usuario.email}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <button
            onClick={guardarCambios}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primaryDark transition"
          >
            <FiSave /> Guardar cambios
          </button>
        </div>

        <hr className="border-gray-300" />

        {/* Contraseña */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Cambiar contraseña</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
              <input
                type="password"
                value={contraseñaActual}
                onChange={(e) => setContraseñaActual(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                value={nuevaContraseña}
                onChange={(e) => setNuevaContraseña(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>

            <button
              onClick={cambiarContraseña}
              className="w-full sm:w-auto px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-secondaryDark transition"
            >
              Cambiar contraseña
            </button>
          </div>

          <div className="text-sm text-gray-500 text-center mt-6">
            ¿No recuerdas la actual?
          </div>

          <div className="flex justify-center">
            <button
              onClick={recuperarContraseña}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Enviar nueva contraseña por correo
            </button>
          </div>
        </div>

        {mensaje && (
          <p
            className={`text-sm text-center mt-6 ${
              mensaje.toLowerCase().includes('correctamente')
                ? 'text-green-600'
                : 'text-tertiary'
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
};

export default Perfil;
