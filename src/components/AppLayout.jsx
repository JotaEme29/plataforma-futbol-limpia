// src/components/AppLayout.jsx

import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';

function AppLayout() {
  return (
    <div className="min-h-screen text-gray-900 font-sans transition-colors duration-300">
      <Navbar />
      <main className="relative z-10">
        {/* El <Outlet> es donde React Router renderiza cada pagina (Dashboard, Plantilla, etc.) */}
        <div className="w-full py-8 px-4 sm:px-6 lg:px-10 xl:px-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
