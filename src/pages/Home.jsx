// src/pages/Home.jsx - Página de Inicio con Autenticación Integrada

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { VisionCoachLogo, FootballField, Trophy, Whistle } from '../components/FootballSVG.jsx';


// Componente para el formulario de Login
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard-club');
    } catch (err) {
      setError('Error al iniciar sesión. Comprueba tu email y contraseña.');
      console.error(err);
    }
  };

  return (
    // auth-form -> Clases para espaciado y alineación
    <div className="w-full text-gray-900 dark:text-gray-100">
      {/* h2 y p.sub -> Clases de texto de Tailwind */}
      <h2 className="text-center text-2xl font-bold mb-1">Iniciar Sesión</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Bienvenido de nuevo</p>

      {/* auth-error -> Clases para un banner de error */}
      {error && (
        <p className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-4 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* form-row -> div con clases de espaciado */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">Correo electrónico</label>
          <input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">Contraseña</label>
          <input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300 mt-4">Iniciar Sesión</button>
      </form>
    </div>
  );
};

// Componente para el formulario de Registro (adaptado de Registro.jsx)
const RegisterForm = () => {
  const navigate = useNavigate();

  const handleRedirectToRegisterClub = () => {
    // Redirige al formulario de registro de club completo.
    // Esto asegura que cada nuevo registro desde la home crea un club.
    navigate('/registro-club');
  };

  return (
    <div className="w-full text-gray-900 dark:text-gray-100">
      <h2 className="text-center text-2xl font-bold mb-1">Crear Cuenta de Club</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Comienza a gestionar tu club</p>

      <div className="text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Para crear un nuevo club, te guiaremos a través de un formulario completo donde podrás registrar los datos de tu club y del administrador.
        </p>
        <button onClick={handleRedirectToRegisterClub} className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors duration-300 mt-4">Continuar al Registro del Club</button>

        {/* Separador */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">o</span>
          </div>
        </div>

        {/* Opción para invitados */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            ¿Recibiste una invitación de un club?
          </p>
          <Link
            to="/aceptar-invitacion"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm"
          >
            Haz clic aquí para aceptarla →
          </Link>
        </div>
      </div>
    </div>
  );
};


function Home() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'

  const activeClasses = "bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white shadow-lg transform scale-105";
  const inactiveClasses = "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";
  const buttonBaseClasses = "w-1/2 py-3 text-sm font-bold rounded-lg transition-all duration-300";


  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900/10 dark:to-blue-900/10 p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        {/* Football field pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <FootballField />
        </div>
      </div>

      {/* Contenedor principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex w-full max-w-6xl overflow-hidden rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border-2 border-green-200 dark:border-green-800"
      >
        {/* Left side - Branding */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 p-12 text-center flex-col justify-center relative overflow-hidden">
          {/* Decorative football elements */}
          <div className="absolute top-10 left-10 opacity-10">
            <Trophy className="w-24 h-24 text-white" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-10">
            <Whistle className="w-20 h-20 text-white" />
          </div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px)`,
            }}></div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8 inline-block"
            >
              <div className="mx-auto transform hover:scale-110 transition-transform duration-300">
                <VisionCoachLogo className="w-28 h-28 drop-shadow-2xl" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-black text-white mb-3 drop-shadow-lg tracking-tight"
            >
              Vision Coach
            </motion.h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-6"
            >
              <p className="text-white/90 text-sm font-bold uppercase tracking-wider">
                Plataforma Profesional
              </p>
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/95 text-lg leading-relaxed font-medium px-4"
            >
              Gestión inteligente de clubes de fútbol.
              <br />
              <span className="text-white/80 text-base">Estrategia • Análisis • Rendimiento</span>
            </motion.p>
          </div>
        </div>
        {/* Right side - Auth forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-gray-800">
          {/* Mobile logo */}
          <div className="md:hidden mb-6 text-center">
            <VisionCoachLogo className="w-20 h-20 mx-auto mb-3" />
            <h2 className="text-2xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vision Coach
            </h2>
          </div>

          {/* Toggle buttons with gradient */}
          <div className="flex mb-8 rounded-xl bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 p-1.5 shadow-inner">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthMode('login')}
              className={`${buttonBaseClasses} ${authMode === 'login' ? activeClasses : inactiveClasses}`}
            >
              Iniciar Sesión
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthMode('register')}
              className={`${buttonBaseClasses} ${authMode === 'register' ? activeClasses : inactiveClasses}`}
            >
              Registrar Club
            </motion.button>
          </div>

          {authMode === 'login' ? <LoginForm /> : <RegisterForm />}

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authMode === 'login'
                ? <>¿No tienes una cuenta? <button onClick={() => setAuthMode('register')} className="font-semibold text-blue-600 hover:underline">Regístrate aquí</button>.</>
                : <>¿Ya tienes una cuenta? <button onClick={() => setAuthMode('login')} className="font-semibold text-blue-600 hover:underline">Inicia sesión</button>.</>
              }
            </p>
          </div>

        </div>
      </motion.div>

      {/* Footer Legal */}
      <footer className="relative z-10 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="space-x-4">
          <Link to="/legales/privacidad" className="hover:text-gray-900 dark:hover:text-white transition-colors hover:underline">Política de Privacidad</Link>
          <span>•</span>
          <Link to="/legales/terminos" className="hover:text-gray-900 dark:hover:text-white transition-colors hover:underline">Términos y Condiciones</Link>
        </div>
        <p className="mt-2 text-xs opacity-70">© {new Date().getFullYear()} Vision Coach. Todos los derechos reservados.</p>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Home;