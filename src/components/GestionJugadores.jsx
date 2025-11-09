// src/components/GestionJugadores.jsx - GESTIÓN DE JUGADORES PARA PLATAFORMA FÚTBOL 2.0

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import CardJugador from './CardJugador';

function GestionJugadores() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPlayer, setNewPlayer] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    posicion: '',
    numeroCamiseta: '',
    telefono: '',
    email: '',
    direccion: '',
    contactoEmergencia: '',
    telefonoEmergencia: ''
  });
  const [inviteData, setInviteData] = useState({
    email: '',
    rol: 'jugador',
    equipoId: ''
  });

  const posiciones = [
    'Portero',
    'Defensa Central',
    'Lateral Derecho',
    'Lateral Izquierdo',
    'Mediocentro Defensivo',
    'Mediocentro',
    'Mediocentro Ofensivo',
    'Extremo Derecho',
    'Extremo Izquierdo',
    'Delantero Centro',
    'Segundo Delantero'
  ];

  const roles = [
    { value: 'jugador', label: 'Jugador' },
    { value: 'entrenador', label: 'Entrenador' },
    { value: 'asistente', label: 'Entrenador Asistente' }
  ];

  useEffect(() => {
    if (currentUser?.clubId) {
      loadEquipos();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedTeam) {
      loadJugadores();
    }
  }, [selectedTeam]);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
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

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    
    const selectedTeamData = equipos.find(eq => eq.id === selectedTeam);
    const maxJugadores = getMaxJugadores(selectedTeamData?.formato || 11);
    
    if (jugadores.length >= maxJugadores) {
      alert(`Has alcanzado el límite máximo de ${maxJugadores} jugadores para este formato de equipo`);
      return;
    }

    // Verificar que el número de camiseta no esté ocupado
    const numeroExiste = jugadores.some(j => j.numeroCamiseta === parseInt(newPlayer.numeroCamiseta));
    if (numeroExiste) {
      alert('El número de camiseta ya está ocupado por otro jugador');
      return;
    }

    try {
      const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam, 'jugadores');
      await addDoc(jugadoresRef, {
        ...newPlayer,
        numeroCamiseta: parseInt(newPlayer.numeroCamiseta),
        fechaNacimiento: new Date(newPlayer.fechaNacimiento),
        fechaRegistro: serverTimestamp(),
        activo: true,
        estadisticas: {
          partidosJugados: 0,
          goles: 0,
          asistencias: 0,
          tarjetasAmarillas: 0,
          tarjetasRojas: 0,
          minutosJugados: 0
        }
      });

      setNewPlayer({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        posicion: '',
        numeroCamiseta: '',
        telefono: '',
        email: '',
        direccion: '',
        contactoEmergencia: '',
        telefonoEmergencia: ''
      });
      setShowNewPlayerForm(false);
      loadJugadores();
    } catch (error) {
      console.error('Error al crear jugador:', error);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    
    try {
      const invitacionesRef = collection(db, 'invitaciones');
      await addDoc(invitacionesRef, {
        ...inviteData,
        clubId: currentUser.clubId,
        clubNombre: currentUser.club?.nombre,
        invitadoPor: currentUser.uid,
        fechaInvitacion: serverTimestamp(),
        estado: 'pendiente'
      });

      alert('Invitación enviada exitosamente');
      setInviteData({ email: '', rol: 'jugador', equipoId: '' });
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error al enviar invitación:', error);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este jugador? Esta acción no se puede deshacer.')) {
      try {
        const playerDocRef = doc(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam, 'jugadores', playerId);
        await deleteDoc(playerDocRef);
        loadJugadores();
      } catch (error) {
        console.error('Error al eliminar jugador:', error);
      }
    }
  };

  const getMaxJugadores = (formato) => {
    const limites = {
      5: 10,
      7: 14,
      8: 16,
      9: 18,
      11: 25
    };
    return limites[formato] || 25;
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = fechaNacimiento.toDate ? fechaNacimiento.toDate() : new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      return edad - 1;
    }
    return edad;
  };

  if (loading) {
    return <div className="loading">Cargando equipos...</div>;
  }

  return (
    <div className="gestion-jugadores">
      <div className="jugadores-header">
        <h2>Gestión de Jugadores</h2>
        <div className="team-selector">
          <label htmlFor="team-select">Seleccionar Equipo:</label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Selecciona un equipo</option>
            {equipos.map(equipo => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre} (Fútbol {equipo.formato})
              </option>
            ))}
          </select>
        </div>
        {selectedTeam && (
          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => setSelectedTeam('')}>Volver a equipos</button>
          </div>
        )}
      </div>

      {!selectedTeam && (
        <div className="teams-grid">
          {equipos.map((equipo) => (
            <div
              key={equipo.id}
              className="team-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTeam(equipo.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTeam(equipo.id); }}
            >
              <h4>{equipo.nombre}</h4>
              <p><strong>Formato:</strong> Futbol {equipo.formato}</p>
              <p><strong>Jugadores:</strong> {equipo.jugadores?.length || 0}/{getMaxJugadores(equipo.formato)}</p>
              {equipo.entrenador && <p><strong>Entrenador:</strong> {equipo.entrenador}</p>}
            </div>
          ))}
        </div>
      )}

      {selectedTeam && (
        <>
          <style>{`
            .players-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;align-items:start}
          `}</style>
          <div className="jugadores-actions">
            <div className="team-info">
              {(() => {
                const team = equipos.find(eq => eq.id === selectedTeam);
                return (
                  <div className="team-stats">
                    <h3>{team?.nombre}</h3>
                    <p><strong>Formato:</strong> Fútbol {team?.formato}</p>
                    <p><strong>Jugadores:</strong> {jugadores.length}/{getMaxJugadores(team?.formato)}</p>
                    <p><strong>Entrenador:</strong> {team?.entrenador || 'No asignado'}</p>
                  </div>
                );
              })()}
            </div>
            <div className="action-buttons">
              <button 
                className="btn-primary"
                onClick={() => setShowNewPlayerForm(true)}
              >
                + Añadir Jugador
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowInviteForm(true)}
              >
                📧 Enviar Invitación
              </button>
            </div>
          </div>

          {/* Lista de Jugadores (grilla compacta con CardJugador) */}
          <div className="players-grid">
            {jugadores.map(jugador => (
              <CardJugador
                key={jugador.id}
                jugador={{
                  id: jugador.id,
                  nombre: jugador.nombre,
                  apellidos: jugador.apellido,
                  posicion: jugador.posicion,
                  dorsal: jugador.numeroCamiseta,
                  total_goles: jugador.estadisticas?.goles || 0,
                  total_asistencias: jugador.estadisticas?.asistencias || 0,
                  total_minutos_jugados: jugador.estadisticas?.minutosJugados || 0,
                  total_convocatorias: jugador.estadisticas?.partidosJugados || 0,
                  valoracion_general_promedio: jugador.valoracion_general_promedio || 0,
                }}
                onEdit={() => {}}
                onDelete={() => handleDeletePlayer(jugador.id)}
              />
            ))}
          </div>

          {jugadores.length === 0 && (
            <div className="empty-state">
              <h3>No hay jugadores registrados</h3>
              <p>Añade jugadores a este equipo para comenzar a gestionar tu plantilla.</p>
            </div>
          )}
        </>
      )}

      {/* Formulario de Nuevo Jugador */}
      {showNewPlayerForm && (
        <div className="form-modal">
          <form onSubmit={handleCreatePlayer} className="new-player-form">
            <h4>Nuevo Jugador</h4>
            <div className="input-row">
              <div className="input-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={newPlayer.nombre}
                  onChange={(e) => setNewPlayer({...newPlayer, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  value={newPlayer.apellido}
                  onChange={(e) => setNewPlayer({...newPlayer, apellido: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Fecha de Nacimiento *</label>
                <input
                  type="date"
                  value={newPlayer.fechaNacimiento}
                  onChange={(e) => setNewPlayer({...newPlayer, fechaNacimiento: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Número de Camiseta *</label>
                <input
                  type="number"
                  value={newPlayer.numeroCamiseta}
                  onChange={(e) => setNewPlayer({...newPlayer, numeroCamiseta: e.target.value})}
                  min="1"
                  max="99"
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Posición *</label>
              <select
                value={newPlayer.posicion}
                onChange={(e) => setNewPlayer({...newPlayer, posicion: e.target.value})}
                required
              >
                <option value="">Seleccionar posición</option>
                {posiciones.map(posicion => (
                  <option key={posicion} value={posicion}>
                    {posicion}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={newPlayer.telefono}
                  onChange={(e) => setNewPlayer({...newPlayer, telefono: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newPlayer.email}
                  onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
                />
              </div>
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input
                type="text"
                value={newPlayer.direccion}
                onChange={(e) => setNewPlayer({...newPlayer, direccion: e.target.value})}
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Contacto de Emergencia</label>
                <input
                  type="text"
                  value={newPlayer.contactoEmergencia}
                  onChange={(e) => setNewPlayer({...newPlayer, contactoEmergencia: e.target.value})}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div className="input-group">
                <label>Teléfono de Emergencia</label>
                <input
                  type="tel"
                  value={newPlayer.telefonoEmergencia}
                  onChange={(e) => setNewPlayer({...newPlayer, telefonoEmergencia: e.target.value})}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Añadir Jugador</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowNewPlayerForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario de Invitación */}
      {showInviteForm && (
        <div className="form-modal">
          <form onSubmit={handleSendInvite} className="invite-form">
            <h4>Enviar Invitación</h4>
            <div className="input-group">
              <label>Email del Invitado *</label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label>Rol *</label>
              <select
                value={inviteData.rol}
                onChange={(e) => setInviteData({...inviteData, rol: e.target.value})}
                required
              >
                {roles.map(rol => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>
            {inviteData.rol === 'jugador' && (
              <div className="input-group">
                <label>Equipo *</label>
                <select
                  value={inviteData.equipoId}
                  onChange={(e) => setInviteData({...inviteData, equipoId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar equipo</option>
                  {equipos.map(equipo => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-primary">Enviar Invitación</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowInviteForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default GestionJugadores;
