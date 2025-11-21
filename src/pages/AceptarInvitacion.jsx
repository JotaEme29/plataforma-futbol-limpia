// src/pages/AceptarInvitacion.jsx - Página para aceptar invitación y crear cuenta

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FaUserPlus, FaLock, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { VisionCoachLogo } from '../components/FootballSVG.jsx';

function AceptarInvitacion() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invitacionId = searchParams.get('id');
  
  const [invitacion, setInvitacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadInvitacion();
  }, [invitacionId]);

  const loadInvitacion = async () => {
    if (!invitacionId) {
      setError('Link de invitación inválido');
      setLoading(false);
      return;
    }

    try {
      // Obtener directamente el documento por ID
      const invitacionDocRef = doc(db, 'invitaciones', invitacionId);
      const invitacionSnap = await getDoc(invitacionDocRef);

      if (!invitacionSnap.exists()) {
        setError('Invitación no encontrada');
        setLoading(false);
        return;
      }

      const invitacionData = { id: invitacionSnap.id, ...invitacionSnap.data() };

      if (invitacionData.estado !== 'pendiente') {
        setError('Esta invitación ya fue utilizada');
        setLoading(false);
        return;
      }

      setInvitacion(invitacionData);
    } catch (err) {
      console.error('Error al cargar invitación:', err);
      setError('Error al cargar la invitación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        invitacion.email,
        formData.password
      );

      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: invitacion.email,
        nombre: invitacion.nombre,
        apellido: invitacion.apellido,
        clubId: invitacion.clubId,
        rol: invitacion.rol,
        equipoId: invitacion.equipoId || null,
        activo: true,
        fechaRegistro: new Date()
      });

      // Marcar invitación como aceptada
      const invitacionDoc = doc(db, 'invitaciones', invitacion.id);
      await updateDoc(invitacionDoc, {
        estado: 'aceptada',
        fechaAceptacion: new Date(),
        usuarioId: userCredential.user.uid
      });

      alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      console.error('Error al crear cuenta:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya tiene una cuenta. Por favor inicia sesión.');
      } else {
        setError('Error al crear la cuenta. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitacion) {
    return ( // UX: Loader de página completa mejorado
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (error && !invitacion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invitación No Válida</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    // UI: Fondo más sobrio y profesional
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <VisionCoachLogo className="w-20 h-20" />
          </motion.div>
          {/* UI: Título más limpio y legible */}
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">¡Bienvenido!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
            Has sido invitado a Vision Coach
          </p>
        </div>

        {/* Invitation Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          // UI: Sombra más sutil y diseño de tarjeta refinado
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {invitacion?.nombre} {invitacion?.apellido}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">{invitacion?.email}</p>
            {/* UI: "Pill" de rol con colores más integrados */}
            <div className="mt-4 inline-block bg-blue-100 dark:bg-blue-900/50 px-4 py-2 rounded-full">
              <span className="text-blue-800 dark:text-blue-300 font-bold text-sm">
                Rol: {invitacion?.rol === 'jugador' ? 'Jugador' : 
                      invitacion?.rol === 'entrenador' ? 'Entrenador' :
                      invitacion?.rol === 'asistente' ? 'Asistente' : 'Usuario'}
              </span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg"
            >
              <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <FaLock className="inline mr-2" />
                Crear Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <FaLock className="inline mr-2" />
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              // UI: Botón principal con color sólido y efectos refinados
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                <>
                  <FaUserPlus className="inline mr-2" />
                  Crear Cuenta y Aceptar Invitación
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default AceptarInvitacion;
