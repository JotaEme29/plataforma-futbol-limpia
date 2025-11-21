// src/pages/DashboardClub.jsx - Dashboard principal con estilo glass claro

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  IoPeopleOutline,
  IoFootballOutline,
  IoCalendarOutline,
  IoBarChartOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoSparklesOutline,
  IoCheckmarkCircle,
  IoArrowForward,
} from 'react-icons/io5';

const formatearFechaCorta = (f) => {
  if (!f) return '';
  const d = f instanceof Date ? f : new Date(f);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

function DashboardClub() {
  const { currentUser } = useAuth();
  const [clubStats, setClubStats] = useState({
    totalEquipos: 0,
    totalJugadores: 0,
    proximosEventos: 0,
    partidosEsteMes: 0,
  });
  const [highlightEvents, setHighlightEvents] = useState({
    proximoEvento: null,
    ultimoPartido: null,
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

      // Lógica de fechas y cálculo
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      let proximosEventos = 0;
      let partidosEsteMes = 0;
      let proximoEvento = null;
      let ultimoPartido = null;

      eventosData.forEach(evento => {
        const fechaEvento = evento.fecha?.toDate ? evento.fecha.toDate() : null;
        if (!fechaEvento) return;

        if (fechaEvento >= hoy) proximosEventos++;
        if (evento.tipo === 'partido' && fechaEvento >= inicioMes && fechaEvento <= finMes) {
          partidosEsteMes++;
        }

        if (fechaEvento >= hoy) {
          if (!proximoEvento || fechaEvento < proximoEvento.fecha) {
            proximoEvento = { ...evento, fecha: fechaEvento };
          }
        }

        if (evento.tipo === 'partido') {
          if (!ultimoPartido || fechaEvento > ultimoPartido.fecha) {
            ultimoPartido = { ...evento, fecha: fechaEvento };
          }
        }
      });

      setClubStats({
        totalEquipos,
        totalJugadores,
        proximosEventos,
        partidosEsteMes,
      });
      setHighlightEvents({
        proximoEvento,
        ultimoPartido,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas del club:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-lg shadow-md border border-black/10 text-gray-800">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-900">
      {/* Encabezado de bienvenida */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-20 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-20 rounded-full -ml-16 -mb-16" />
        <div className="relative z-10 space-y-2 text-gray-900">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <IoSparklesOutline className="text-purple-800" />
            Bienvenido, {currentUser?.nombre}
          </h1>
          <p className="text-sm md:text-base text-indigo-900/80">
            Panel de control de{' '}
            <span className="font-semibold text-gray-900">
              {currentUser?.club?.nombre}
            </span>
          </p>
          <div className="flex items-center gap-2 text-indigo-900/80 text-xs md:text-sm pt-1">
            <IoCheckmarkCircle className="text-green-800" />
            <span>Sistema activo y funcionando</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<IoPeopleOutline />} value={clubStats.totalJugadores} label="Jugadores totales" color="blue" />
        <StatCard icon={<IoFootballOutline />} value={clubStats.totalEquipos} label="Equipos registrados" color="green" />
        <StatCard icon={<IoCalendarOutline />} value={clubStats.proximosEventos} label="Próximos eventos" color="purple" />
        <StatCard icon={<IoBarChartOutline />} value={clubStats.partidosEsteMes} label="Partidos este mes" color="red" />
      </div>

      {/* Resumen de actividad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HighlightCard
          title="Próximo evento"
          event={highlightEvents.proximoEvento}
          emptyText="No hay eventos próximos programados."
        />
        <HighlightCard
          title="Último partido"
          event={highlightEvents.ultimoPartido}
          emptyText="Todavía no hay partidos registrados."
          showScore
        />
      </div>

      {/* Herramientas de gestión */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/25 via-amber-400/25 to-sky-500/25 p-6 rounded-2xl shadow-xl border border-white/50 backdrop-blur-md">
        <div className="mb-4 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Herramientas de gestión
          </h2>
          <p className="text-xs md:text-sm text-gray-700 mt-1">
            Accesos rápidos a las funciones principales
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          <ActionCard
            to="/gestion-club"
            icon={<IoShieldCheckmarkOutline />}
            title="Gestión del club"
            description="Administra equipos y categorías."
            color="blue"
          />
          <ActionCard
            to="/estadisticas"
            icon={<IoBarChartOutline />}
            title="Estadísticas"
            description="Analiza el rendimiento del club."
            color="purple"
          />
          <ActionCard
            to="#"
            icon={<IoWalletOutline />}
            title="Finanzas"
            description="Control de ingresos y gastos."
            isComingSoon
            color="green"
          />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-20 rounded-full -ml-6 -mb-6" />
      </div>
    </div>
  );
}

const StatCard = ({ icon, value, label, color }) => {
  const palettes = {
    blue: 'from-orange-500/40 via-amber-400/40 to-sky-500/40',
    green: 'from-orange-500/40 via-amber-400/40 to-sky-500/40',
    purple: 'from-orange-500/40 via-amber-400/40 to-sky-500/40',
    red: 'from-orange-500/40 via-amber-400/40 to-sky-500/40',
  };
  const palette = palettes[color] || palettes.blue;

  return (
    <div className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-black/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${palette} text-white text-2xl flex items-center justify-center shadow-md`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
    </div>
  );
};

const HighlightCard = ({ title, event, emptyText, showScore = false }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-black/10 p-6 flex flex-col gap-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {event?.tipo && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${event.tipo === 'partido'
            ? 'bg-red-500/20 text-red-600'
            : 'bg-blue-500/20 text-blue-600'}`}>
            {event.tipo}
          </span>
        )}
      </div>
      {event ? (
        <>
          <div>
            <p className="text-xl font-bold text-gray-900 line-clamp-2">
              {event.titulo || 'Sin título'}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
              <IoCalendarOutline />
              {formatearFechaCorta(event.fecha)}
            </p>
          </div>
          {showScore && (
            <div className="mt-2 flex items-center justify-between text-sm">
              {typeof event.marcador_local === 'number' && typeof event.marcador_visitante === 'number' ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-gray-600">Marcador:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {event.marcador_local} - {event.marcador_visitante}
                  </span>
                </div>
              ) : (
                <span className="text-gray-600">Resultado pendiente.</span>
              )}
            </div>
          )}
          <div className="mt-auto pt-4 flex justify-end">
            <Link
              to="/eventos"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-driblab-accent text-driblab-dark transition-transform duration-300 hover:scale-105"
            >
              Ver detalles <IoArrowForward className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600 h-full flex items-center justify-center">{emptyText}</p>
      )}
    </div>
  );
};

const ActionCard = ({ to, icon, title, description, isComingSoon, color }) => {
  const palettes = {
    blue: 'from-orange-500/40 via-amber-400/40 to-sky-500/40',
    green: 'from-orange-500/40 via-amber-400/40 to-sky-500/40',
    purple: 'from-orange-500/40 via-amber-400/40 to-sky-500/40',
  };
  const palette = palettes[color] || palettes.blue;

  return (
    <Link
      to={to}
      className={`group bg-white/80 backdrop-blur-md border border-black/10 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isComingSoon ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`bg-gradient-to-br ${palette} p-3 rounded-lg text-white text-2xl shadow-md`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-md text-gray-900 mb-1">
            {title}
            {isComingSoon && (
              <span className="ml-2 text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full font-bold">
                Próx.
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default DashboardClub;
