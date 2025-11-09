// src/pages/DashboardClub.jsx - DASHBOARD PRINCIPAL PARA PLATAFORMA FÚTBOL 2.0

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { FaUsers, FaFutbol, FaCalendarAlt, FaChartBar, FaShieldAlt, FaPiggyBank } from 'react-icons/fa';

function DashboardClub() {
  const { currentUser } = useAuth();
  const [clubStats, setClubStats] = useState({
    totalEquipos: 0,
    totalJugadores: 0,
    proximosEventos: 0,
    partidosEsteMes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.clubId) {
      loadClubStats();
    }
  }, [currentUser]);

  const loadClubStats = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los equipos del club
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalEquipos = equiposData.length;

      // Cargar todos los jugadores del club iterando por equipo
      let totalJugadores = 0;
      for (const equipo of equiposData) {
        const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', equipo.id, 'jugadores');
        const jugadoresSnapshot = await getDocs(jugadoresRef);
        totalJugadores += jugadoresSnapshot.size;
      }

      // Cargar todos los eventos y procesarlos en el cliente
      const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
      const eventosSnapshot = await getDocs(eventosRef);
      const eventosData = eventosSnapshot.docs.map(doc => doc.data());

      // --- LÓGICA DE FECHAS Y CÁLCULO RESTAURADA ---
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar a la medianoche para comparaciones correctas
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      let proximosEventos = 0;
      let partidosEsteMes = 0;

      eventosData.forEach(evento => {
        const fechaEvento = evento.fecha.toDate();
        if (fechaEvento >= hoy) proximosEventos++;
        if (evento.tipo === 'partido' && fechaEvento >= inicioMes && fechaEvento <= finMes) partidosEsteMes++;
      });

      setClubStats({
        totalEquipos,
        totalJugadores,
        proximosEventos,
        partidosEsteMes
      });
      
    } catch (error) {
      console.error('Error al cargar estadísticas del club:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Encabezado de Bienvenida */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bienvenido al Dashboard, {currentUser?.nombre}!
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Aquí tienes un resumen de la actividad de tu club: <strong>{currentUser?.club?.nombre}</strong>.
        </p>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FaUsers />} value={clubStats.totalJugadores} label="Jugadores Totales" color="blue" />
        <StatCard icon={<FaFutbol />} value={clubStats.totalEquipos} label="Equipos Registrados" color="green" />
        <StatCard icon={<FaCalendarAlt />} value={clubStats.proximosEventos} label="Próximos Eventos" color="purple" />
        <StatCard icon={<FaChartBar />} value={clubStats.partidosEsteMes} label="Partidos este Mes" color="red" />
      </div>

      {/* Acciones Rápidas (Menú Restaurado) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Herramientas de Gestión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard to="/gestion-club" icon={<FaShieldAlt />} title="Gestión del Club" description="Administra equipos y categorías." />
          <ActionCard to="/estadisticas" icon={<FaChartBar />} title="Estadísticas" description="Analiza el rendimiento del club." />
          <ActionCard to="#" icon={<FaPiggyBank />} title="Finanzas" description="Control de ingresos y gastos (Próximamente)." isComingSoon />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, value, label, color }) => {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-violet-500',
    red: 'from-red-500 to-pink-500',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-transform duration-300`}>
      <div className="flex justify-between items-start">
        <div className="text-4xl font-black">{value}</div>
        <div className="bg-white/20 p-3 rounded-xl">
          {icon}
        </div>
      </div>
      <p className="mt-4 font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
};

const ActionCard = ({ to, icon, title, description, isComingSoon }) => (
  <Link to={to} className={`block p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors transform hover:scale-105 ${isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
    <div className="flex items-center gap-4">
      <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg text-blue-600 dark:text-blue-300">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </Link>
);

export default DashboardClub;
