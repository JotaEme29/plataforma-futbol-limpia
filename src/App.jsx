import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa guardianes
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';

// Layout con sidebar
import AppLayout from './components/AppLayout.jsx';

// Páginas públicas y de autenticación
import Home from './pages/Home.jsx';
import RegistroClub from './pages/RegistroClub.jsx'; // Importamos el componente correcto

// Páginas privadas v2.0 (clubes)
import DashboardClub from './pages/DashboardClub.jsx';
import GestionRolesPage from './pages/GestionRolesPage.jsx';
import Plantilla from './pages/Plantilla.jsx';
import DetalleJugador from './pages/DetalleJugador.jsx';
import Eventos from './pages/Eventos.jsx';
import DetalleEvento from './pages/DetalleEvento.jsx';
import GestionClubPage from './pages/GestionClubPage.jsx'; // Nueva página
import EstadisticasAnalisis from './components/EstadisticasAnalisis.jsx'; // Componente de estadísticas

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de inicio y autenticación */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/registro-club" element={<PublicRoute><RegistroClub /></PublicRoute>} />
 
        {/* Rutas privadas envueltas con layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard-club" element={<DashboardClub />} />
          {/* Rutas que coinciden con la nueva Navbar */}
          <Route path="/plantilla" element={<Plantilla />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/gestion-roles" element={<GestionRolesPage />} />
          {/* Rutas con parámetros */}
          <Route path="/jugador/:jugadorId" element={<DetalleJugador />} />
          <Route path="/evento/:eventoId" element={<DetalleEvento />} />
          {/* Nuevas rutas para las herramientas */}
          <Route path="/gestion-club" element={<GestionClubPage />} />
          <Route path="/estadisticas" element={<EstadisticasAnalisis />} />
        </Route>
 
        {/* Catch-all 404 */}
        <Route path="*" element={<div><h2>404 - Página no encontrada</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;
