// src/components/ActionLogger.jsx - REGISTRADOR DE ACCIONES EN TIEMPO REAL

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';

function ActionLogger() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const tiposAccion = [
    { id: 'gol', label: '⚽ Gol', color: '#28a745', points: 1 },
    { id: 'asistencia', label: '🎯 Asistencia', color: '#007bff', points: 1 },
    { id: 'tarjeta_amarilla', label: '🟨 Tarjeta Amarilla', color: '#ffc107', points: -1 },
    { id: 'tarjeta_roja', label: '🟥 Tarjeta Roja', color: '#dc3545', points: -3 },
    { id: 'sustitucion_entra', label: '🔄 Entra', color: '#17a2b8', points: 0 },
    { id: 'sustitucion_sale', label: '🔄 Sale', color: '#6c757d', points: 0 },
    { id: 'falta', label: '⚠️ Falta', color: '#fd7e14', points: -0.5 },
    { id: 'corner', label: '📐 Corner', color: '#6f42c1', points: 0.5 },
    { id: 'tiro_libre', label: '🎯 Tiro Libre', color: '#20c997', points: 0.5 },
    { id: 'parada', label: '🥅 Parada', color: '#e83e8c', points: 1 }
  ];

  useEffect(() => {
    if (currentUser?.clubId) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedTeam) {
      loadJugadores();
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedEvent) {
      loadEventActions();
    }
  }, [selectedEvent]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar equipos
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);

      // Cargar eventos de tipo partido
      const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
      const q = query(eventosRef, where('tipo', '==', 'partido'), orderBy('fecha', 'desc'));
      const eventosSnapshot = await getDocs(q);
      const eventosData = eventosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEventos(eventosData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJugadores = async () => {
    try {
      const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam, 'jugadores');
      const q = query(jugadoresRef, orderBy('numeroCamiseta', 'asc'));
      const jugadoresSnapshot = await getDocs(q);
      const jugadoresData = jugadoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJugadores(jugadoresData);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
    }
  };

  const loadEventActions = async () => {
    try {
      const actionsRef = collection(db, 'clubes', currentUser.clubId, 'match_actions');
      const q = query(actionsRef, where('eventoId', '==', selectedEvent), orderBy('minuto', 'asc'));
      const actionsSnapshot = await getDocs(q);
      const actionsData = actionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActions(actionsData);
    } catch (error) {
      console.error('Error al cargar acciones:', error);
    }
  };

  const handleStartMatch = () => {
    setIsActive(true);
    setCurrentMinute(0);
    setActions([]);
  };

  const handleEndMatch = async () => {
    setIsActive(false);
    
    // Procesar estadísticas finales
    await processMatchStatistics();
    
    alert('Partido finalizado. Estadísticas procesadas exitosamente.');
  };

  const processMatchStatistics = async () => {
    try {
      // Agrupar acciones por jugador
      const playerStats = {};
      
      actions.forEach(action => {
        if (!playerStats[action.jugadorId]) {
          playerStats[action.jugadorId] = {
            goles: 0,
            asistencias: 0,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            minutosJugados: 90 // Por defecto, se puede ajustar con sustituciones
          };
        }
        
        switch (action.tipo) {
          case 'gol':
            playerStats[action.jugadorId].goles++;
            break;
          case 'asistencia':
            playerStats[action.jugadorId].asistencias++;
            break;
          case 'tarjeta_amarilla':
            playerStats[action.jugadorId].tarjetasAmarillas++;
            break;
          case 'tarjeta_roja':
            playerStats[action.jugadorId].tarjetasRojas++;
            break;
          case 'sustitucion_sale':
            playerStats[action.jugadorId].minutosJugados = action.minuto;
            break;
          case 'sustitucion_entra':
            playerStats[action.jugadorId].minutosJugados = 90 - action.minuto;
            break;
        }
      });

      // Actualizar estadísticas de cada jugador
      for (const [jugadorId, stats] of Object.entries(playerStats)) {
        const jugadorRef = doc(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam, 'jugadores', jugadorId);
        
        // Obtener estadísticas actuales
        const jugador = jugadores.find(j => j.id === jugadorId);
        const currentStats = jugador?.estadisticas || {};
        
        await updateDoc(jugadorRef, {
          estadisticas: {
            partidosJugados: (currentStats.partidosJugados || 0) + 1,
            goles: (currentStats.goles || 0) + stats.goles,
            asistencias: (currentStats.asistencias || 0) + stats.asistencias,
            tarjetasAmarillas: (currentStats.tarjetasAmarillas || 0) + stats.tarjetasAmarillas,
            tarjetasRojas: (currentStats.tarjetasRojas || 0) + stats.tarjetasRojas,
            minutosJugados: (currentStats.minutosJugados || 0) + stats.minutosJugados
          }
        });
      }

      // Actualizar estadísticas del equipo
      const equipoRef = doc(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam);
      const equipo = equipos.find(e => e.id === selectedTeam);
      const equipoStats = equipo?.estadisticas || {};
      
      const totalGoles = Object.values(playerStats).reduce((sum, stats) => sum + stats.goles, 0);
      
      await updateDoc(equipoRef, {
        estadisticas: {
          ...equipoStats,
          partidosJugados: (equipoStats.partidosJugados || 0) + 1,
          golesAFavor: (equipoStats.golesAFavor || 0) + totalGoles
        }
      });

    } catch (error) {
      console.error('Error al procesar estadísticas:', error);
    }
  };

  const logAction = async (tipo, jugadorId, descripcion = '') => {
    try {
      const action = {
        eventoId: selectedEvent,
        equipoId: selectedTeam,
        jugadorId,
        tipo,
        minuto: currentMinute,
        descripcion,
        timestamp: serverTimestamp(),
        registradoPor: currentUser.uid
      };

      const actionsRef = collection(db, 'clubes', currentUser.clubId, 'match_actions');
      const docRef = await addDoc(actionsRef, action);
      
      // Añadir a la lista local
      setActions(prev => [...prev, { id: docRef.id, ...action }]);
      
    } catch (error) {
      console.error('Error al registrar acción:', error);
    }
  };

  const getJugadorNombre = (jugadorId) => {
    const jugador = jugadores.find(j => j.id === jugadorId);
    return jugador ? `#${jugador.numeroCamiseta} ${jugador.nombre} ${jugador.apellido}` : 'Jugador no encontrado';
  };

  const getEquipoNombre = (equipoId) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  };

  const getEventoNombre = (eventoId) => {
    const evento = eventos.find(ev => ev.id === eventoId);
    return evento ? evento.titulo : 'Evento no encontrado';
  };

  const getTipoAccionInfo = (tipo) => {
    return tiposAccion.find(t => t.id === tipo) || { label: tipo, color: '#6c757d' };
  };

  if (loading) {
    return <div className="loading">Cargando Action Logger...</div>;
  }

  return (
    <div className="action-logger">
      <div className="logger-header">
        <h2>Action Logger - Registro en Tiempo Real</h2>
        <div className="match-status">
          {isActive ? (
            <div className="status-active">
              <span className="status-indicator active"></span>
              <span>Partido en curso - Minuto {currentMinute}</span>
            </div>
          ) : (
            <div className="status-inactive">
              <span className="status-indicator inactive"></span>
              <span>Partido no iniciado</span>
            </div>
          )}
        </div>
      </div>

      {/* Configuración del Partido */}
      <div className="match-setup">
        <h3>Configuración del Partido</h3>
        <div className="setup-controls">
          <div className="control-group">
            <label>Equipo:</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={isActive}
            >
              <option value="">Seleccionar equipo</option>
              {equipos.map(equipo => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Evento/Partido:</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              disabled={isActive}
            >
              <option value="">Seleccionar evento</option>
              {eventos.filter(evento => evento.equipoId === selectedTeam).map(evento => (
                <option key={evento.id} value={evento.id}>
                  {evento.titulo}
                </option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Minuto actual:</label>
            <input
              type="number"
              value={currentMinute}
              onChange={(e) => setCurrentMinute(parseInt(e.target.value) || 0)}
              min="0"
              max="120"
              disabled={!isActive}
            />
          </div>
        </div>

        <div className="match-controls">
          {!isActive ? (
            <button 
              className="btn-success"
              onClick={handleStartMatch}
              disabled={!selectedTeam || !selectedEvent}
            >
              🚀 Iniciar Partido
            </button>
          ) : (
            <button 
              className="btn-danger"
              onClick={handleEndMatch}
            >
              🏁 Finalizar Partido
            </button>
          )}
        </div>
      </div>

      {/* Panel de Acciones */}
      {isActive && selectedTeam && jugadores.length > 0 && (
        <div className="actions-panel">
          <h3>Registro de Acciones</h3>
          
          {/* Tipos de Acción */}
          <div className="action-types">
            {tiposAccion.map(tipo => (
              <div key={tipo.id} className="action-type-section">
                <h4 style={{ color: tipo.color }}>{tipo.label}</h4>
                <div className="players-grid">
                  {jugadores.map(jugador => (
                    <button
                      key={jugador.id}
                      className="player-action-btn"
                      style={{ borderColor: tipo.color }}
                      onClick={() => logAction(tipo.id, jugador.id)}
                    >
                      <span className="player-number">#{jugador.numeroCamiseta}</span>
                      <span className="player-name">{jugador.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed de Acciones */}
      {actions.length > 0 && (
        <div className="actions-feed">
          <h3>Feed de Acciones ({actions.length})</h3>
          <div className="feed-list">
            {actions.slice().reverse().map(action => {
              const tipoInfo = getTipoAccionInfo(action.tipo);
              return (
                <div key={action.id} className="feed-item">
                  <div className="feed-minute">
                    <span className="minute-badge">{action.minuto}'</span>
                  </div>
                  <div className="feed-content">
                    <div className="feed-action" style={{ color: tipoInfo.color }}>
                      {tipoInfo.label}
                    </div>
                    <div className="feed-player">
                      {getJugadorNombre(action.jugadorId)}
                    </div>
                    {action.descripcion && (
                      <div className="feed-description">
                        {action.descripcion}
                      </div>
                    )}
                  </div>
                  <div className="feed-timestamp">
                    {action.timestamp?.toDate?.()?.toLocaleTimeString() || 'Ahora'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estadísticas en Tiempo Real */}
      {isActive && actions.length > 0 && (
        <div className="live-stats">
          <h3>Estadísticas del Partido</h3>
          <div className="live-stats-grid">
            <div className="stat-item">
              <div className="stat-value">
                {actions.filter(a => a.tipo === 'gol').length}
              </div>
              <div className="stat-label">Goles</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {actions.filter(a => a.tipo === 'tarjeta_amarilla').length}
              </div>
              <div className="stat-label">Tarjetas Amarillas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {actions.filter(a => a.tipo === 'tarjeta_roja').length}
              </div>
              <div className="stat-label">Tarjetas Rojas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {actions.filter(a => a.tipo === 'corner').length}
              </div>
              <div className="stat-label">Corners</div>
            </div>
          </div>
        </div>
      )}

      {/* Estado Vacío */}
      {!selectedTeam && (
        <div className="empty-state">
          <h3>Selecciona un equipo para comenzar</h3>
          <p>Elige el equipo y el evento para iniciar el registro de acciones en tiempo real.</p>
        </div>
      )}
    </div>
  );
}

export default ActionLogger;
