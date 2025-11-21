// src/components/EstadisticasAnalisis.jsx - Modern Stats & Analysis System
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  FaUsers,
  FaFutbol,
  FaClock,
  FaChartLine,
  FaTrophy,
  FaRegCalendarCheck,
} from 'react-icons/fa';
import RankingGoles from './RankingGoles';
import RankingAsistencias from './RankingAsistencias';
import RankingMinutos from './RankingMinutos';
import RankingPromedio from './RankingPromedio';
import GraficoEvolucion from './GraficoEvolucion';
import './EstadisticasAnalisis.css';

function EstadisticasAnalisis() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [estadisticasClub, setEstadisticasClub] = useState({
    totalEquipos: 0,
    totalJugadores: 0,
    totalEventos: 0,
    partidosJugados: 0,
    entrenamientos: 0,
    proximosEventos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.clubId) {
      loadAllData();
    }
  }, [currentUser]);

  const calcularEstadisticasClub = useCallback(
    async (equiposData, eventosData) => {
      const stats = {
        totalEquipos: equiposData.length,
        totalJugadores: 0,
        totalEventos: eventosData.length,
        partidosJugados: 0,
        entrenamientos: 0,
        proximosEventos: 0,
      };

      for (const equipo of equiposData) {
        const jugadoresRef = collection(
          db,
          'clubes',
          currentUser.clubId,
          'equipos',
          equipo.id,
          'jugadores',
        );
        const jugadoresSnapshot = await getDocs(jugadoresRef);
        stats.totalJugadores += jugadoresSnapshot.size;
      }

      const ahora = new Date();
      eventosData.forEach((evento) => {
        if (evento.tipo === 'partido') stats.partidosJugados += 1;
        else if (evento.tipo === 'entrenamiento') stats.entrenamientos += 1;
        const fechaEvento = evento.fecha?.toDate
          ? evento.fecha.toDate()
          : new Date(evento.fecha);
        if (fechaEvento > ahora) stats.proximosEventos += 1;
      });

      setEstadisticasClub(stats);
    },
    [currentUser],
  );

  useEffect(() => {
    if (!selectedTeam) {
      setJugadores([]);
      return;
    }
    const loadTeamData = async () => {
      try {
        const jugadoresRef = collection(
          db,
          'clubes',
          currentUser.clubId,
          'equipos',
          selectedTeam,
          'jugadores',
        );
        const q = query(jugadoresRef, orderBy('numero_camiseta', 'asc'));
        const jugadoresSnapshot = await getDocs(q);
        setJugadores(
          jugadoresSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      } catch (error) {
        console.error('Error al cargar jugadores del equipo:', error);
      }
    };
    loadTeamData();
  }, [selectedTeam, currentUser]);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEquipos(equiposData);

      const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
      const eventosSnapshot = await getDocs(eventosRef);
      const eventosData = eventosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
    const equipo = equipos.find((eq) => eq.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  };

  const jugadoresNormalizados = jugadores.map((j) => ({
    ...j,
    total_goles: j.total_goles ?? j.estadisticas?.goles ?? 0,
    total_asistencias: j.asistencias ?? j.estadisticas?.asistencias ?? 0,
    total_minutos_jugados: j.minutos_jugados ?? j.estadisticas?.minutos ?? 0,
  }));

  const calcularPromedioEdad = () => {
    const edades = jugadores
      .map((jugador) => {
        if (!jugador.fecha_nacimiento && !jugador.fechaNacimiento) return null;
        const fecha =
          jugador.fecha_nacimiento?.toDate?.() ??
          jugador.fechaNacimiento?.toDate?.() ??
          new Date(jugador.fecha_nacimiento || jugador.fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fecha.getFullYear();
        const m = hoy.getMonth() - fecha.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
          edad -= 1;
        }
        return edad;
      })
      .filter((e) => typeof e === 'number' && e > 0);

    return edades.length > 0
      ? Math.round(
          edades.reduce((sum, edad) => sum + edad, 0) / edades.length,
        )
      : 0;
  };

  const getEventosRecientes = () => {
    return eventos
      .filter((evento) => {
        const fechaEvento = evento.fecha?.toDate
          ? evento.fecha.toDate()
          : new Date(evento.fecha);
        const ahora = new Date();
        const diferenciaDias =
          (ahora.getTime() - fechaEvento.getTime()) / (1000 * 60 * 60 * 24);
        return diferenciaDias >= 0 && diferenciaDias <= 30;
      })
      .sort((a, b) => {
        const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
        const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
        return fechaB.getTime() - fechaA.getTime();
      })
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="stats-container stats-content-wrapper">
      {/* Encabezado */}
      <div className="stats-header">
        <div>
          <h1 className="stats-title">Estadísticas y análisis</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visualiza el rendimiento de tu club, equipos y jugadores.
          </p>
        </div>
        <div className="stats-filters">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="filter-select"
          >
            <option value="">Resumen del club</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas de resumen club */}
      <div className="stats-summary">
        <div className="glass-effect border border-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <div className="summary-value">{estadisticasClub.totalJugadores}</div>
          <div className="summary-label">Jugadores activos</div>
        </div>
        <div className="glass-effect border border-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <div className="summary-value">{estadisticasClub.partidosJugados}</div>
          <div className="summary-label">Partidos jugados</div>
        </div>
        <div className="glass-effect border border-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <div className="summary-value">{estadisticasClub.entrenamientos}</div>
          <div className="summary-label">Entrenamientos</div>
        </div>
        <div className="glass-effect border border-black/30 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <div className="summary-value">{estadisticasClub.proximosEventos}</div>
          <div className="summary-label">Próximos eventos</div>
        </div>
      </div>

      {/* Grid principal de estadísticas */}
      <div className="stats-grid">
        {/* Evolución individual */}
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">
              <FaChartLine style={{ marginRight: 8 }} />
              Evolución de valoración individual
            </h3>
          </div>
          {selectedTeam && jugadoresNormalizados.length > 0 ? (
            <div style={{ height: '260px' }}>
              <GraficoEvolucion jugadores={jugadoresNormalizados} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Selecciona un equipo para ver la evolución de sus jugadores.
            </p>
          )}
        </div>

        {/* Distribución de minutos */}
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">
              <FaClock style={{ marginRight: 8 }} />
              Distribución de minutos jugados
            </h3>
          </div>
          {selectedTeam && jugadoresNormalizados.length > 0 ? (
            <div style={{ height: '260px' }}>
              <RankingMinutos jugadores={jugadoresNormalizados} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Selecciona un equipo para ver la distribución de minutos.
            </p>
          )}
        </div>

        {/* Rankings de goles y asistencias */}
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">
              <FaTrophy style={{ marginRight: 8 }} />
              Rankings de goles y asistencias
            </h3>
          </div>
          {selectedTeam && jugadoresNormalizados.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ height: '220px' }}>
                <RankingGoles jugadores={jugadoresNormalizados} />
              </div>
              <div style={{ height: '220px' }}>
                <RankingAsistencias jugadores={jugadoresNormalizados} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Selecciona un equipo para ver rankings de goles y asistencias.
            </p>
          )}
        </div>

        {/* Ranking de valoración promedio */}
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">
              <FaUsers style={{ marginRight: 8 }} />
              Ranking de valoración promedio
            </h3>
          </div>
          {jugadoresNormalizados.length > 0 ? (
            <RankingPromedio jugadores={jugadoresNormalizados} />
          ) : (
            <p className="text-sm text-gray-500">
              Se mostrarán valoraciones cuando haya evaluaciones registradas.
            </p>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">
              <FaRegCalendarCheck style={{ marginRight: 8 }} />
              Actividad reciente del club
            </h3>
          </div>
          <div className="ranking-list">
            {getEventosRecientes().length > 0 ? (
              getEventosRecientes().map((evento) => (
                <div key={evento.id} className="ranking-item">
                  <div className="ranking-info">
                    <div className="ranking-name">{evento.titulo}</div>
                    <div className="ranking-meta">
                      <span className="ranking-meta-label">Equipo</span>
                      <span className="ranking-meta-value">
                        {getEquipoNombre(evento.equipoId)}
                      </span>
                    </div>
                  </div>
                  <div className="ranking-value">
                    {evento.fecha?.toDate
                      ? evento.fecha
                          .toDate()
                          .toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                      : 'Fecha no disponible'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No hay actividad registrada en los últimos 30 días.
              </p>
            )}
          </div>
        </div>

        {/* Resumen por equipo seleccionado */}
        {selectedTeam && jugadores.length > 0 && (
          <div className="stats-card">
            <div className="stats-card-header">
              <h3 className="stats-card-title">
                <FaFutbol style={{ marginRight: 8 }} />
                Resumen del equipo
              </h3>
            </div>
            <div className="stats-summary">
              <div className="summary-card">
                <div className="summary-value">{jugadores.length}</div>
                <div className="summary-label">Jugadores</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">{calcularPromedioEdad()}</div>
                <div className="summary-label">Edad promedio</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">
                  {jugadores.reduce(
                    (total, j) => total + (j.estadisticas?.goles || j.total_goles || 0),
                    0,
                  )}
                </div>
                <div className="summary-label">Goles totales</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">
                  {jugadores.reduce(
                    (total, j) =>
                      total + (j.estadisticas?.asistencias || j.total_asistencias || 0),
                    0,
                  )}
                </div>
                <div className="summary-label">Asistencias totales</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EstadisticasAnalisis;

