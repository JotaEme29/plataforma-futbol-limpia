// src/pages/Home.jsx - Página de Inicio con Autenticación Integrada

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import visionCoachLogo from '../../vision-coach-logo.png';
import footballPattern from '../../assets/img/football-pattern.png';
import { FootballField, Trophy, Whistle } from '../components/FootballSVG.jsx';


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
    <div className="w-full text-gray-900 dark:text-gray-100">
      <h2 className="text-center text-2xl font-bold mb-1">Iniciar Sesión</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Bienvenido de nuevo</p>

      {error && (
        <p className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-4 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">Correo electrónico</label>
          <input
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="correo@club.com"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">Contraseña</label>
          <input
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 via-amber-400 to-sky-500 shadow-md hover:shadow-lg transition-all duration-200 mt-2"
        >
          Entrar
        </button>
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
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Activa tu staff y jugadores en minutos</p>

      <div className="text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Te guiaremos paso a paso para registrar tu club, cuerpo técnico y plantilla con nuestro asistente.
        </p>
        <button
          onClick={handleRedirectToRegisterClub}
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-green-500 via-teal-500 to-sky-500 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Continuar al registro
        </button>

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
            ¿Recibiste una invitación?
          </p>
          <Link
            to="/aceptar-invitacion"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm"
          >
            Aceptar invitación
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

  const activeClasses = "bg-white text-gray-900 shadow-md transform scale-105";
  const inactiveClasses = "text-white/90 hover:text-white";
  const buttonBaseClasses = "w-1/2 py-3 text-sm font-bold rounded-lg transition-all duration-300";

  const overlayColor = theme === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)';
  const backgroundStyle = {
    backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${footballPattern})`,
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto',
    backgroundAttachment: 'fixed',
  };


  return (
    <div
      className="flex flex-col min-h-screen w-full items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden"
      style={backgroundStyle}
    >
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
        className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border border-orange-200/60 dark:border-amber-800/60"
      >
        {/* Left side - Branding */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-500 via-amber-400 to-sky-500 p-12 text-center flex-col justify-center relative overflow-hidden">
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
                <img src={visionCoachLogo} alt="Vision Coach Logo" className="w-28 h-28 drop-shadow-2xl" />
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
            <img src={visionCoachLogo} alt="Vision Coach Logo" className="w-20 h-20 mx-auto mb-3" />
            <h2 className="text-2xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vision Coach
            </h2>
          </div>

          {/* Toggle buttons with gradient */}
          <div className="flex mb-8 rounded-xl bg-gradient-to-r from-orange-100 via-amber-100 to-sky-100 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 p-1.5 shadow-inner">
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
