// src/components/Navbar.jsx

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';
import { VisionCoachLogo } from '../components/FootballSVG.jsx';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
    { to: '/dashboard-club', label: 'Dashboard' },
    { to: '/plantilla', label: 'Plantilla' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/gestion-roles', label: 'Gestión' }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo with animation */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <VisionCoachLogo className="w-10 h-10" />
              <div className="flex flex-col">
                <span className="text-lg font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  Vision Coach
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold -mt-1">
                  Pro Platform
                </span>
              </div>
            </motion.div>
            
            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl shadow-lg"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-semibold mr-2 hidden sm:block">
              {currentUser?.email}
            </span>
            
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 bg-gray-100 dark:bg-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
            </motion.button>
            
            {/* Logout button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-3 rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="Cerrar sesión"
            >
              <FaSignOutAlt className="text-lg" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;