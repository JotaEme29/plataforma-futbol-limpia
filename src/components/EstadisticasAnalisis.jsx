// src/components/EstadisticasAnalisis.jsx - Modern Stats & Analysis System
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  FaUsers, 
  FaFutbol, 
  FaClock, 
  FaChartLine,
  FaTrophy,
  FaRegCalendarCheck
} from 'react-icons/fa';
import RankingGoles from './RankingGoles';
import RankingAsistencias from './RankingAsistencias';
import RankingMinutos from './RankingMinutos';
import RankingPromedio from './RankingPromedio';
import GraficoEvolucion from './GraficoEvolucion';

function EstadisticasAnalisis() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [estadisticasClub, setEstadisticasClub] = useState({
    totalEquipos: 0,
    totalJugadores: 0,
    promedioEdad: 0,
    eventosUltimoMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (currentUser?.clubId) {
      loadAllData();
    }
  }, [currentUser]);

  const calcularEstadisticasClub = useCallback(async (equiposData, eventosData) => {
    const stats = {
      totalEquipos: equiposData.length,
      totalJugadores: 0,
      totalEventos: eventosData.length,
      partidosJugados: 0,
      entrenamientos: 0,
      proximosEventos: 0
    };

    for (const equipo of equiposData) {
      const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', equipo.id, 'jugadores');
      const jugadoresSnapshot = await getDocs(jugadoresRef);
      stats.totalJugadores += jugadoresSnapshot.size;
    }

    const ahora = new Date();
    eventosData.forEach(evento => {
      if (evento.tipo === 'partido') stats.partidosJugados++;
      else if (evento.tipo === 'entrenamiento') stats.entrenamientos++;
      const fechaEvento = evento.fecha?.toDate ? evento.fecha.toDate() : new Date(evento.fecha);
      if (fechaEvento > ahora) stats.proximosEventos++;
    });

    setEstadisticasClub(stats);
  }, [currentUser]); // Depende de currentUser para acceder a clubId

  // Este useEffect se ejecutará SOLO cuando selectedTeam cambie.
  useEffect(() => {
    if (!selectedTeam) {
      setJugadores([]);
      return;
    }
    const loadTeamData = async () => {
      try {
        const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam, 'jugadores');
        const q = query(jugadoresRef, orderBy('numero_camiseta', 'asc'));
        const jugadoresSnapshot = await getDocs(q);
        setJugadores(jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error al cargar jugadores del equipo:', error);
      }
    }
    loadTeamData();
  }, [selectedTeam, currentUser]); // Depende de selectedTeam y currentUser

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEquipos(equiposData);

      const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
      const eventosSnapshot = await getDocs(eventosRef);
      const eventosData = eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(eventosData);

      await calcularEstadisticasClub(equiposData, eventosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, calcularEstadisticasClub]);

  useEffect(() => {
    if (currentUser?.clubId) loadAllData();
  }, [currentUser, loadAllData]);

  const getEquipoNombre = (equipoId) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  };

  // Normaliza estructura de jugadores para componentes de ranking
  const jugadoresNormalizados = jugadores.map(j => ({
    ...j,
    total_goles: (j.total_goles ?? j.estadisticas?.goles ?? 0),
    total_asistencias: (j.asistencias ?? j.estadisticas?.asistencias ?? 0),
    total_minutos_jugados: (j.total_minutos_jugados ?? j.estadisticas?.minutosJugados ?? 0),
  }));

  const getTopJugadores = () => {
    return jugadores
      .sort((a, b) => (b.estadisticas?.goles || 0) - (a.estadisticas?.goles || 0))
      .slice(0, 5);
  };

  const getJugadoresMasActivos = () => {
    return jugadores
      .sort((a, b) => (b.estadisticas?.partidosJugados || 0) - (a.estadisticas?.partidosJugados || 0))
      .slice(0, 5);
  };

  const calcularPromedioEdad = () => {
    if (jugadores.length === 0) return 0;
    
    const edades = jugadores.map(jugador => {
      if (!jugador.fechaNacimiento) return 0;
      const hoy = new Date();
      const nacimiento = jugador.fechaNacimiento.toDate ? jugador.fechaNacimiento.toDate() : new Date(jugador.fechaNacimiento);
      return hoy.getFullYear() - nacimiento.getFullYear();
    }).filter(edad => edad > 0);
    
    return edades.length > 0 ? Math.round(edades.reduce((sum, edad) => sum + edad, 0) / edades.length) : 0;
  };

  const getEventosRecientes = () => {
    return eventos
      .filter(evento => {
        const fechaEvento = evento.fecha?.toDate ? evento.fecha.toDate() : new Date(evento.fecha);
        const ahora = new Date();
        const diferenciaDias = (ahora - fechaEvento) / (1000 * 60 * 60 * 24);
        return diferenciaDias >= 0 && diferenciaDias <= 30; // Últimos 30 días
      })
      .sort((a, b) => {
        const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
        const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
        return fechaB - fechaA;
      })
      .slice(0, 5);
  };

  const renderResumenTab = () => (
    <div>
      <h3>Resumen del Club</h3>
      <div className="stats-grid-modern">
        <div className="stat-card-modern">
          <h3>{estadisticasClub.totalEquipos}</h3>
          <p>Equipos</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.totalJugadores}</h3>
          <p>Jugadores</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.totalEventos}</h3>
          <p>Eventos Totales</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.partidosJugados}</h3>
          <p>Partidos</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.entrenamientos}</h3>
          <p>Entrenamientos</p>
        </div>
        <div className="stat-card-modern">
          <h3>{estadisticasClub.proximosEventos}</h3>
          <p>Próximos Eventos</p>
        </div>
      </div>

      <h3>Distribución por Equipos</h3>
      <div className="stats-grid-modern">
        {equipos.map(equipo => (
          <div key={equipo.id} className="stat-card-modern">
            <h4>{equipo.nombre}</h4>
            <p><strong>Formato:</strong> Fútbol {equipo.formato}</p>
            <p><strong>Entrenador:</strong> {equipo.entrenador || 'No asignado'}</p>
          </div>
        ))}
      </div>

      <h3>Actividad Reciente</h3>
      <div className="stats-grid-modern">
        {getEventosRecientes().map(evento => (
          <div key={evento.id} className="stat-card-modern">
            <h5>{evento.titulo}</h5>
            <p>{getEquipoNombre(evento.equipoId)}</p>
            <span>
              {evento.fecha?.toDate ? evento.fecha.toDate().toLocaleDateString('es-ES') : 'Fecha no disponible'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJugadoresTab = () => (
    <div>
      <h3>Estadísticas de Jugadores</h3>
      <div className="eventos-filters-modern">
        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          <option value="">Selecciona un equipo</option>
          {equipos.map(equipo => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && jugadores.length > 0 && (
        <div className="stats-grid-modern">
          <div className="stat-card-modern">
            <h3>{jugadores.length}</h3>
            <p>Jugadores</p>
          </div>
          <div className="stat-card-modern">
            <h3>{calcularPromedioEdad()}</h3>
            <p>Edad Promedio</p>
          </div>
          <div className="stat-card-modern">
            <h3>{jugadores.reduce((total, j) => total + (j.estadisticas?.goles || 0), 0)}</h3>
            <p>Goles Totales</p>
          </div>
          <div className="stat-card-modern">
            <h3>{jugadores.reduce((total, j) => total + (j.estadisticas?.asistencias || 0), 0)}</h3>
            <p>Asistencias Totales</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderComparativasTab = () => (
    <div>
      <h3>🚧 Comparativas y Análisis Avanzado</h3>
      <p>Esta sección incluirá:</p>
      <ul>
        <li>Comparativas entre jugadores</li>
        <li>Análisis de rendimiento por posición</li>
        <li>Gráficos de evolución temporal</li>
        <li>Métricas avanzadas de rendimiento</li>
        <li>Comparación entre equipos del club</li>
      </ul>
      <p>Estará disponible en la siguiente actualización.</p>
    </div>
  );

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estadísticas y Análisis</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visualiza el rendimiento de tu club y tus equipos.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <select 
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Resumen del Club</option>
            {equipos.map(equipo => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-2xl font-bold">{estadisticasClub.totalJugadores}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Jugadores Activos</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-2xl font-bold">{estadisticasClub.partidosJugados}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Partidos Jugados</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-2xl font-bold">{estadisticasClub.entrenamientos}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Entrenamientos</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <h4 className="text-2xl font-bold">{estadisticasClub.proximosEventos}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Próximos Eventos</p>
        </div>
      </div>

      {/* Contenido Principal con Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda: Evolución */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">Evolución del Rendimiento</h3>
          {/* El componente GraficoEvolucion necesita ser refactorizado para que funcione aquí */}
          <div className="h-96 flex items-center justify-center text-gray-400">
            <p>Gráfico de Evolución (Próximamente)</p>
          </div>
        </div>

        {/* Columna Derecha: Rankings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">Rankings del Equipo</h3>
          {selectedTeam && jugadores.length > 0 ? (
            <div className="h-96">
              <RankingGoles jugadores={jugadoresNormalizados} />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              <p>Selecciona un equipo para ver los rankings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EstadisticasAnalisis;
