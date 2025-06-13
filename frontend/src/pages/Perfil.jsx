import { useState } from 'react';
import { FiKey, FiMail, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Perfil = () => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'success' });

  const email = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  const mostrarPopup = (message, type = 'success') => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ visible: false, message: '', type: 'success' }), 3000);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
    <div className="max-w-xl mx-auto bg-white p-6 md:p-10 shadow-lg rounded-2xl space-y-6 mt-10 border border-gray-200">
      <h2 className="text-2xl font-serif text-primary mb-4 flex items-center gap-2">
        <FiKey /> Seguridad de la Cuenta
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Correo electrónico</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Contraseña actual</label>
          <input
            type="password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm"
            placeholder="Introduce tu contraseña actual"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Nueva contraseña</label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm"
            placeholder="Nueva contraseña"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm"
            placeholder="Repite la nueva contraseña"
          />
        </div>

        <button
          onClick={cambiarContraseña}
          className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          <FiCheckCircle /> Cambiar contraseña
        </button>

        <div className="text-center text-sm text-gray-500 my-4">¿Has olvidado tu contraseña?</div>

        <button
          onClick={recuperarContraseña}
          className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm"
        >
          <FiMail /> Enviar nueva contraseña al correo
        </button>
      </div>

      {popup.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 rounded-2xl p-6 w-full max-w-sm mx-4 text-center shadow-md">
            <div className="flex flex-col items-center space-y-4">
              {popup.type === 'success' ? (
                <FiCheckCircle size={48} className="text-green-500 animate-pop" />
              ) : (
                <FiXCircle size={48} className="text-danger animate-pop" />
              )}
              <h2 className={`text-xl font-semibold ${popup.type === 'success' ? 'text-green-600' : 'text-danger'}`}>
                {popup.type === 'success' ? 'Éxito' : 'Error'}
              </h2>
              <p className="text-sm text-gray-700">{popup.message}</p>
              <p className="text-xs text-tertiary">Este mensaje se cerrará automáticamente.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
