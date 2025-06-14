import { useEffect, useState } from 'react';
import { FiKey, FiMail, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Perfil = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'success' });

  const token = localStorage.getItem('token');

  const mostrarPopup = (message, type = 'success') => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ visible: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setNombre(data.nombre || '');
          setEmail(data.email || '');
        }
      } catch (err) {
        console.error('Error al obtener el usuario:', err);
      }
    };

    if (token) {
      obtenerUsuario();
    }
  }, [token]);

  const actualizarNombre = async () => {
    if (!nombre.trim()) {
      mostrarPopup('El nombre no puede estar vacío.', 'error');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuario/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        mostrarPopup(data.error || 'Error al actualizar nombre.', 'error');
        return;
      }

      localStorage.setItem('username', nombre);
      mostrarPopup('Nombre actualizado correctamente.');
    } catch (err) {
      mostrarPopup('Error al conectar con el servidor.', 'error');
    }
  };

  const cambiarContraseña = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      mostrarPopup('Completa todos los campos.', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      mostrarPopup('Las contraseñas no coinciden.', 'error');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuario/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contraseñaActual: oldPass, nuevaContraseña: newPass }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        mostrarPopup(data.error || 'Error al cambiar contraseña.', 'error');
        return;
      }

      mostrarPopup('Contraseña actualizada correctamente.');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      mostrarPopup('Error al conectar con el servidor.', 'error');
    }
  };

  const recuperarContraseña = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuario/recuperar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        mostrarPopup(data.error || 'No se pudo enviar el correo.', 'error');
        return;
      }

      mostrarPopup('Se ha enviado una nueva contraseña al correo.');
    } catch (err) {
      mostrarPopup('Error al enviar el correo.', 'error');
    }
  };


  return (
  <div className="max-w-2xl xl:max-w-3xl 2xl:max-w-screen-lg mx-auto bg-white p-6 md:p-10 xl:p-12 shadow-lg rounded-2xl space-y-6 mt-10 border border-gray-200">
    <h2 className="text-2xl xl:text-3xl font-serif text-primary mb-4 flex items-center gap-2">
      <FiKey /> Seguridad de la Cuenta
    </h2>

    <div className="space-y-5 xl:space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-600">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg text-sm xl:text-base"
        />
        <button
          onClick={actualizarNombre}
          className="mt-2 btn btn-secondary w-full text-sm xl:text-base"
        >
          Guardar nuevo nombre
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">Correo electrónico</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 text-sm xl:text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Contraseña actual</label>
        <input
          type="password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm xl:text-base"
          placeholder="Introduce tu contraseña actual"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Nueva contraseña</label>
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm xl:text-base"
          placeholder="Nueva contraseña"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Confirmar nueva contraseña</label>
        <input
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm xl:text-base"
          placeholder="Repite la nueva contraseña"
        />
      </div>

      <button
        onClick={cambiarContraseña}
        className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm xl:text-base"
      >
        <FiCheckCircle /> Cambiar contraseña
      </button>

      <div className="text-center text-sm xl:text-base text-gray-500 my-4">
        ¿Has olvidado tu contraseña?
      </div>

      <button
        onClick={recuperarContraseña}
        className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm xl:text-base"
      >
        <FiMail /> Enviar nueva contraseña al correo
      </button>
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
              <FiCheckCircle size={48} className="text-primaryStrong animate-pop" />
            ) : popup.type ==='error' ? (
              <FiXCircle size={48} className="text-danger animate-pop" />
            ) : (
              <FiAlertTriangle size={48} className="text-warning animate-pop" />
            )}
             <h2 className={`text-xl xl:text-2xl font-serif font-semibold ${
              popup.type === 'success'
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
              {popup.secondary && 
                <p className="text-sm text-tertiary">{popup.secondary}</p>
              }
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
}

export default Perfil;
