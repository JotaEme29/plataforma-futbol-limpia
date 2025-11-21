// src/components/Navbar.jsx

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import visionCoachLogo from '../../vision-coach-logo.png';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { to: '/gestion-roles', label: 'Gestión' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm border-b border-white/30 dark:border-white/5 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-black/10 overflow-hidden flex items-center justify-center">
                <img src={visionCoachLogo} alt="Vision Coach" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-semibold bg-gradient-to-r from-orange-500/80 via-amber-400/80 to-sky-500/80 bg-clip-text text-transparent leading-tight">
                  Vision Coach
                </span>
                <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium -mt-0.5">
                  Pro Platform
                </span>
              </div>
            </motion.div>

            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
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
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/70 via-amber-400/70 to-sky-500/70 rounded-lg shadow-sm"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
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
          <div className="flex items-center gap-2.5">
            <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium mr-1 hidden sm:block">
              {currentUser?.email}
            </span>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-yellow-50/90 dark:hover:bg-yellow-900/30 transition-colors duration-200 shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FaMoon className="text-sm" /> : <FaSun className="text-sm" />}
            </motion.button>

            {/* Logout button - Hidden on mobile */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="hidden md:block px-3 py-2 rounded-lg text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-colors duration-200 shadow-sm"
              aria-label="Cerrar sesión"
            >
              <FaSignOutAlt className="text-sm" />
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200/60 dark:border-gray-700/60 overflow-hidden bg-white/80 dark:bg-gray-900/90 backdrop-blur-md"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/70 via-amber-400/70 to-sky-500/70 text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {/* Logout button for mobile */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
