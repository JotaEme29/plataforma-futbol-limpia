// src/components/GestionEventos.jsx - Modern Event Management
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { 
  FaCalendarPlus, 
  FaEye, 
  FaTrash, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUsers,
  FaCalendarAlt,
  FaListUl
} from 'react-icons/fa';
import './GestionEventos.css';

function GestionEventos() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'partido', 'entrenamiento', 'reunion'
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    tipo: 'entrenamiento',
    equipoId: '',
    fecha: '',
    hora: '',
    duracion: 90,
    ubicacion: '',
    descripcion: '',
    equipoRival: '',
    esLocal: true,
    objetivos: '',
    materialNecesario: '',
    observaciones: ''
  });

  const tiposEvento = [
    { value: 'entrenamiento', label: '🏃‍♂️ Entrenamiento', color: '#28a745' },
    { value: 'partido', label: '⚽ Partido', color: '#dc3545' },
    { value: 'reunion', label: '👥 Reunión', color: '#007bff' },
    { value: 'evento_especial', label: '🎉 Evento Especial', color: '#ffc107' }
  ];

  useEffect(() => {
    if (currentUser?.clubId) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedTeam || filterType !== 'todos') {
      loadEventos();
    }
  }, [selectedTeam, filterType]);

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
      
      // Cargar todos los eventos inicialmente
      await loadEventos();
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventos = async () => {
    try {
      const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
      let q = query(eventosRef, orderBy('fecha', 'desc'));
      
      // Aplicar filtros
      if (selectedTeam) {
        q = query(eventosRef, where('equipoId', '==', selectedTeam), orderBy('fecha', 'desc'));
      }
      
      const eventosSnapshot = await getDocs(q);
      let eventosData = eventosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filtrar por tipo si es necesario
      if (filterType !== 'todos') {
        eventosData = eventosData.filter(evento => evento.tipo === filterType);
      }
      
      setEventos(eventosData);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      const fechaHora = new Date(`${newEvent.fecha}T${newEvent.hora}`);
      
      const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
      await addDoc(eventosRef, {
        ...newEvent,
        fecha: Timestamp.fromDate(fechaHora),
        duracion: parseInt(newEvent.duracion),
        fechaCreacion: serverTimestamp(),
        creadoPor: currentUser.uid,
        estado: 'programado',
        asistencia: [],
        convocados: []
      });

      setNewEvent({
        titulo: '',
        tipo: 'entrenamiento',
        equipoId: '',
        fecha: '',
        hora: '',
        duracion: 90,
        ubicacion: '',
        descripcion: '',
        equipoRival: '',
        esLocal: true,
        objetivos: '',
        materialNecesario: '',
        observaciones: ''
      });
      setShowNewEventForm(false);
      loadEventos();
    } catch (error) {
      console.error('Error al crear evento:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      try {
        const eventDocRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventId);
        await deleteDoc(eventDocRef);
        loadEventos();
      } catch (error) {
        console.error('Error al eliminar evento:', error);
      }
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEquipoNombre = (equipoId) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  };

  const getTipoInfo = (tipo) => {
    return tiposEvento.find(t => t.value === tipo) || { label: tipo, color: '#6c757d' };
  };

  const getEventosProximos = () => {
    const ahora = new Date();
    return eventos.filter(evento => {
      const fechaEvento = evento.fecha.toDate ? evento.fecha.toDate() : new Date(evento.fecha);
      return fechaEvento > ahora;
    }).slice(0, 3);
  };

  if (loading) {
    return <div className="loading">Cargando eventos...</div>;
  }

  return (
    <div>
      <div className="info-card-modern">
        <h2>Gestión de Eventos y Entrenamientos</h2>
        <div className="actions-grid-modern">
          <button className="action-btn-modern" onClick={() => setShowNewEventForm(true)}>
            + Nuevo Evento
          </button>
        </div>
      </div>

      <div className="info-card-modern">
        <div className="eventos-filters-modern">
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="">Todos los equipos</option>
            {equipos.map(equipo => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            {tiposEvento.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="eventos-grid-modern">
        {eventos.map(evento => {
          const tipoInfo = getTipoInfo(evento.tipo);
          return (
            <div key={evento.id} className="evento-card-modern">
              <h4 style={{ color: tipoInfo.color }}>{evento.titulo}</h4>
              <p><strong>Equipo:</strong> {getEquipoNombre(evento.equipoId)}</p>
              <p><strong>Fecha:</strong> {formatearFecha(evento.fecha)}</p>
              <p><strong>Ubicación:</strong> {evento.ubicacion || 'No especificada'}</p>
              <div className="actions-grid-modern">
                <button className="action-btn-modern" onClick={() => navigate(`/eventos/${evento.id}`)}><FaEye /></button>
                <button className="action-btn-modern" onClick={() => handleDeleteEvent(evento.id)}><FaTrash /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showNewEventForm && (
        <div className="form-modal">
          <form onSubmit={handleCreateEvent} className="new-event-form">
            <h4>Nuevo Evento</h4>
            
            <div className="input-group">
              <label>Título del Evento *</label>
              <input
                type="text"
                value={newEvent.titulo}
                onChange={(e) => setNewEvent({...newEvent, titulo: e.target.value})}
                placeholder="Ej: Entrenamiento técnico, Partido vs Real Madrid"
                required
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Tipo de Evento *</label>
                <select
                  value={newEvent.tipo}
                  onChange={(e) => setNewEvent({...newEvent, tipo: e.target.value})}
                  required
                >
                  {tiposEvento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="input-group">
                <label>Equipo *</label>
                <select
                  value={newEvent.equipoId}
                  onChange={(e) => setNewEvent({...newEvent, equipoId: e.target.value})}
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
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={newEvent.fecha}
                  onChange={(e) => setNewEvent({...newEvent, fecha: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Hora *</label>
                <input
                  type="time"
                  value={newEvent.hora}
                  onChange={(e) => setNewEvent({...newEvent, hora: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Duración (minutos) *</label>
                <input
                  type="number"
                  value={newEvent.duracion}
                  onChange={(e) => setNewEvent({...newEvent, duracion: e.target.value})}
                  min="15"
                  max="300"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Ubicación</label>
              <input
                type="text"
                value={newEvent.ubicacion}
                onChange={(e) => setNewEvent({...newEvent, ubicacion: e.target.value})}
                placeholder="Ej: Campo de entrenamiento, Estadio Municipal"
              />
            </div>

            {newEvent.tipo === 'partido' && (
              <>
                <div className="input-row">
                  <div className="input-group">
                    <label>Equipo Rival</label>
                    <input
                      type="text"
                      value={newEvent.equipoRival}
                      onChange={(e) => setNewEvent({...newEvent, equipoRival: e.target.value})}
                      placeholder="Nombre del equipo rival"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Tipo de Partido</label>
                    <select
                      value={newEvent.esLocal}
                      onChange={(e) => setNewEvent({...newEvent, esLocal: e.target.value === 'true'})}
                    >
                      <option value={true}>Local</option>
                      <option value={false}>Visitante</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {newEvent.tipo === 'entrenamiento' && (
              <>
                <div className="input-group">
                  <label>Objetivos del Entrenamiento</label>
                  <textarea
                    value={newEvent.objetivos}
                    onChange={(e) => setNewEvent({...newEvent, objetivos: e.target.value})}
                    placeholder="Ej: Mejorar pases cortos, trabajar jugadas a balón parado"
                    rows="3"
                  />
                </div>
                
                <div className="input-group">
                  <label>Material Necesario</label>
                  <textarea
                    value={newEvent.materialNecesario}
                    onChange={(e) => setNewEvent({...newEvent, materialNecesario: e.target.value})}
                    placeholder="Ej: Conos, balones, petos, porterías pequeñas"
                    rows="2"
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label>Descripción</label>
              <textarea
                value={newEvent.descripcion}
                onChange={(e) => setNewEvent({...newEvent, descripcion: e.target.value})}
                placeholder="Descripción adicional del evento"
                rows="3"
              />
            </div>

            <div className="input-group">
              <label>Observaciones</label>
              <textarea
                value={newEvent.observaciones}
                onChange={(e) => setNewEvent({...newEvent, observaciones: e.target.value})}
                placeholder="Observaciones especiales, recordatorios, etc."
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Crear Evento</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowNewEventForm(false)}
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

export default GestionEventos;
