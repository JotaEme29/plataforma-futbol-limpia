// src/components/AppLayout.jsx

import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import FeedbackWidget from './FeedbackWidget';
import OnboardingTour from './OnboardingTour';

function AppLayout() {
  return (
    <div className="min-h-screen text-gray-900 font-sans transition-colors duration-300">
      <Navbar />
      <main className="relative z-10">
        {/* El <Outlet> es donde React Router renderiza cada pagina (Dashboard, Plantilla, etc.) */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <FeedbackWidget />
      <OnboardingTour />
    </div>
  );
}

export default AppLayout;
