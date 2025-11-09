// src/components/AppLayout.jsx

import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import { FootballField } from './FootballSVG.jsx';

function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-green-900/5 dark:to-blue-900/10 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Animated background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        {/* Football field pattern */}
        <div className="absolute inset-0 opacity-3 dark:opacity-5">
          <FootballField />
        </div>
      </div>

      <Navbar />
      <main className="relative z-10">
        {/* El <Outlet> es donde React Router renderizará la página específica (Dashboard, Plantilla, etc.) */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
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

export default AppLayout;
