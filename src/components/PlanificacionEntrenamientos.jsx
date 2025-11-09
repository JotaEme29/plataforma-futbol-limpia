// src/components/PlanificacionEntrenamientos.jsx - PLANIFICACIÓN DETALLADA DE ENTRENAMIENTOS

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

function PlanificacionEntrenamientos() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [sesiones, setSesiones] = useState([]);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({
    titulo: '',
    equipoId: '',
    categoria: 'tecnico',
    duracion: 90,
    objetivos: '',
    materialNecesario: '',
    calentamiento: {
      duracion: 15,
      ejercicios: ['']
    },
    partePrincipal: {
      duracion: 60,
      ejercicios: ['']
    },
    vueltaCalma: {
      duracion: 15,
      ejercicios: ['']
    },
    observaciones: '',
    intensidad: 'media'
  });

  const categoriasSesion = [
    { value: 'tecnico', label: '⚽ Técnico', color: '#007bff' },
    { value: 'tactico', label: '🧠 Táctico', color: '#28a745' },
    { value: 'fisico', label: '💪 Físico', color: '#dc3545' },
    { value: 'psicologico', label: '🧘 Psicológico', color: '#6f42c1' },
    { value: 'mixto', label: '🔄 Mixto', color: '#fd7e14' }
  ];

  const intensidades = [
    { value: 'baja', label: 'Baja', color: '#28a745' },
    { value: 'media', label: 'Media', color: '#ffc107' },
    { value: 'alta', label: 'Alta', color: '#dc3545' }
  ];

  const ejerciciosPredefindos = {
    calentamiento: [
      'Trote suave 5 minutos',
      'Movilidad articular',
      'Estiramientos dinámicos',
      'Activación con balón',
      'Pases en parejas',
      'Conducción libre'
    ],
    tecnico: [
      'Pases cortos en triángulo',
      'Control y pase con ambas piernas',
      'Conducción con cambios de ritmo',
      'Tiros a portería desde diferentes ángulos',
      'Centros y remates',
      'Regate 1vs1',
      'Toques de balón en espacio reducido'
    ],
    tactico: [
      'Posesión 4vs2',
      'Transiciones ataque-defensa',
      'Jugadas a balón parado',
      'Presión alta coordinada',
      'Salida de balón desde atrás',
      'Finalización en superioridad numérica'
    ],
    fisico: [
      'Sprints de 20 metros',
      'Circuito de agilidad',
      'Saltos pliométricos',
      'Resistencia con balón',
      'Ejercicios de core',
      'Trabajo de velocidad'
    ],
    vueltaCalma: [
      'Trote regenerativo',
      'Estiramientos estáticos',
      'Ejercicios de respiración',
      'Relajación muscular',
      'Charla técnica',
      'Hidratación y feedback'
    ]
  };

  useEffect(() => {
    if (currentUser?.clubId) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedTeam) {
      loadSesiones();
    }
  }, [selectedTeam]);

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
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSesiones = async () => {
    try {
      const sesionesRef = collection(db, 'clubes', currentUser.clubId, 'sesiones_entrenamiento');
      const q = query(
        sesionesRef, 
        where('equipoId', '==', selectedTeam),
        orderBy('fechaCreacion', 'desc')
      );
      const sesionesSnapshot = await getDocs(q);
      const sesionesData = sesionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSesiones(sesionesData);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    try {
      const sesionesRef = collection(db, 'clubes', currentUser.clubId, 'sesiones_entrenamiento');
      await addDoc(sesionesRef, {
        ...newSession,
        duracion: parseInt(newSession.duracion),
        calentamiento: {
          ...newSession.calentamiento,
          duracion: parseInt(newSession.calentamiento.duracion),
          ejercicios: newSession.calentamiento.ejercicios.filter(ej => ej.trim() !== '')
        },
        partePrincipal: {
          ...newSession.partePrincipal,
          duracion: parseInt(newSession.partePrincipal.duracion),
          ejercicios: newSession.partePrincipal.ejercicios.filter(ej => ej.trim() !== '')
        },
        vueltaCalma: {
          ...newSession.vueltaCalma,
          duracion: parseInt(newSession.vueltaCalma.duracion),
          ejercicios: newSession.vueltaCalma.ejercicios.filter(ej => ej.trim() !== '')
        },
        fechaCreacion: serverTimestamp(),
        creadoPor: currentUser.uid
      });

      setNewSession({
        titulo: '',
        equipoId: '',
        categoria: 'tecnico',
        duracion: 90,
        objetivos: '',
        materialNecesario: '',
        calentamiento: {
          duracion: 15,
          ejercicios: ['']
        },
        partePrincipal: {
          duracion: 60,
          ejercicios: ['']
        },
        vueltaCalma: {
          duracion: 15,
          ejercicios: ['']
        },
        observaciones: '',
        intensidad: 'media'
      });
      setShowNewSessionForm(false);
      loadSesiones();
    } catch (error) {
      console.error('Error al crear sesión:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.')) {
      try {
        const sessionDocRef = doc(db, 'clubes', currentUser.clubId, 'sesiones_entrenamiento', sessionId);
        await deleteDoc(sessionDocRef);
        loadSesiones();
      } catch (error) {
        console.error('Error al eliminar sesión:', error);
      }
    }
  };

  const addEjercicio = (seccion) => {
    setNewSession(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        ejercicios: [...prev[seccion].ejercicios, '']
      }
    }));
  };

  const updateEjercicio = (seccion, index, value) => {
    setNewSession(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        ejercicios: prev[seccion].ejercicios.map((ej, i) => i === index ? value : ej)
      }
    }));
  };

  const removeEjercicio = (seccion, index) => {
    setNewSession(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        ejercicios: prev[seccion].ejercicios.filter((_, i) => i !== index)
      }
    }));
  };

  const addEjercicioPredefinido = (seccion, ejercicio) => {
    setNewSession(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        ejercicios: [...prev[seccion].ejercicios.filter(ej => ej.trim() !== ''), ejercicio, '']
      }
    }));
  };

  const getEquipoNombre = (equipoId) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  };

  const getCategoriaInfo = (categoria) => {
    return categoriasSesion.find(cat => cat.value === categoria) || { label: categoria, color: '#6c757d' };
  };

  const getIntensidadInfo = (intensidad) => {
    return intensidades.find(int => int.value === intensidad) || { label: intensidad, color: '#6c757d' };
  };

  const exportarSesionPDF = (sesion) => {
    // Funcionalidad para exportar a PDF (placeholder)
    alert('Funcionalidad de exportación a PDF en desarrollo');
  };

  if (loading) {
    return <div className="loading">Cargando planificación de entrenamientos...</div>;
  }

  return (
    <div className="planificacion-entrenamientos">
      <div className="entrenamientos-header">
        <h2>Planificación de Entrenamientos</h2>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowNewSessionForm(true)}
            disabled={!selectedTeam}
          >
            + Nueva Sesión
          </button>
        </div>
      </div>

      {/* Selector de Equipo */}
      <div className="team-selector-section">
        <div className="selector-content">
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
      </div>

      {selectedTeam && (
        <>
          {/* Estadísticas de Sesiones */}
          <div className="sesiones-stats">
            <div className="stat-card">
              <div className="stat-value">{sesiones.length}</div>
              <div className="stat-label">Sesiones Creadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {sesiones.reduce((total, sesion) => total + (sesion.duracion || 0), 0)}
              </div>
              <div className="stat-label">Minutos Planificados</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {new Set(sesiones.map(s => s.categoria)).size}
              </div>
              <div className="stat-label">Categorías Diferentes</div>
            </div>
          </div>

          {/* Lista de Sesiones */}
          <div className="sesiones-list">
            <h3>Sesiones de Entrenamiento ({sesiones.length})</h3>
            <div className="sesiones-grid">
              {sesiones.map(sesion => {
                const categoriaInfo = getCategoriaInfo(sesion.categoria);
                const intensidadInfo = getIntensidadInfo(sesion.intensidad);
                return (
                  <div key={sesion.id} className="sesion-card">
                    <div className="sesion-header">
                      <div className="sesion-title-section">
                        <h4>{sesion.titulo}</h4>
                        <div className="sesion-badges">
                          <span 
                            className="categoria-badge"
                            style={{ backgroundColor: categoriaInfo.color }}
                          >
                            {categoriaInfo.label}
                          </span>
                          <span 
                            className="intensidad-badge"
                            style={{ backgroundColor: intensidadInfo.color }}
                          >
                            {intensidadInfo.label}
                          </span>
                        </div>
                      </div>
                      <div className="sesion-actions">
                        <button 
                          className="btn-small"
                          onClick={() => setShowSessionDetails(sesion)}
                        >
                          Ver Detalles
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => exportarSesionPDF(sesion)}
                        >
                          📄 PDF
                        </button>
                        <button 
                          className="btn-small btn-danger"
                          onClick={() => handleDeleteSession(sesion.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    
                    <div className="sesion-summary">
                      <div className="summary-item">
                        <strong>Duración:</strong> {sesion.duracion} min
                      </div>
                      <div className="summary-item">
                        <strong>Objetivos:</strong> {sesion.objetivos || 'No especificados'}
                      </div>
                      <div className="summary-structure">
                        <strong>Estructura:</strong>
                        <div className="structure-timeline">
                          <div className="timeline-item">
                            <span className="timeline-duration">{sesion.calentamiento?.duracion || 15}min</span>
                            <span className="timeline-label">Calentamiento</span>
                          </div>
                          <div className="timeline-item">
                            <span className="timeline-duration">{sesion.partePrincipal?.duracion || 60}min</span>
                            <span className="timeline-label">Parte Principal</span>
                          </div>
                          <div className="timeline-item">
                            <span className="timeline-duration">{sesion.vueltaCalma?.duracion || 15}min</span>
                            <span className="timeline-label">Vuelta a la Calma</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {sesiones.length === 0 && (
              <div className="empty-state">
                <h3>No hay sesiones planificadas</h3>
                <p>Crea tu primera sesión de entrenamiento para comenzar a planificar las actividades del equipo.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Formulario de Nueva Sesión */}
      {showNewSessionForm && (
        <div className="form-modal">
          <form onSubmit={handleCreateSession} className="new-session-form">
            <h4>Nueva Sesión de Entrenamiento</h4>
            
            <div className="input-group">
              <label>Título de la Sesión *</label>
              <input
                type="text"
                value={newSession.titulo}
                onChange={(e) => setNewSession({...newSession, titulo: e.target.value})}
                placeholder="Ej: Técnica de pase y control"
                required
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Equipo *</label>
                <select
                  value={newSession.equipoId}
                  onChange={(e) => setNewSession({...newSession, equipoId: e.target.value})}
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
              
              <div className="input-group">
                <label>Categoría *</label>
                <select
                  value={newSession.categoria}
                  onChange={(e) => setNewSession({...newSession, categoria: e.target.value})}
                  required
                >
                  {categoriasSesion.map(categoria => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="input-group">
                <label>Intensidad *</label>
                <select
                  value={newSession.intensidad}
                  onChange={(e) => setNewSession({...newSession, intensidad: e.target.value})}
                  required
                >
                  {intensidades.map(intensidad => (
                    <option key={intensidad.value} value={intensidad.value}>
                      {intensidad.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Duración Total (minutos) *</label>
              <input
                type="number"
                value={newSession.duracion}
                onChange={(e) => setNewSession({...newSession, duracion: e.target.value})}
                min="30"
                max="180"
                required
              />
            </div>

            <div className="input-group">
              <label>Objetivos de la Sesión</label>
              <textarea
                value={newSession.objetivos}
                onChange={(e) => setNewSession({...newSession, objetivos: e.target.value})}
                placeholder="Ej: Mejorar la precisión en pases cortos, trabajar el control orientado"
                rows="3"
              />
            </div>

            <div className="input-group">
              <label>Material Necesario</label>
              <textarea
                value={newSession.materialNecesario}
                onChange={(e) => setNewSession({...newSession, materialNecesario: e.target.value})}
                placeholder="Ej: 20 conos, 15 balones, 4 porterías pequeñas, petos"
                rows="2"
              />
            </div>

            {/* Estructura de la Sesión */}
            <div className="session-structure">
              <h5>Estructura de la Sesión</h5>
              
              {/* Calentamiento */}
              <div className="structure-section">
                <div className="section-header">
                  <h6>🔥 Calentamiento</h6>
                  <div className="duration-input">
                    <label>Duración:</label>
                    <input
                      type="number"
                      value={newSession.calentamiento.duracion}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        calentamiento: {
                          ...newSession.calentamiento,
                          duracion: e.target.value
                        }
                      })}
                      min="5"
                      max="30"
                    />
                    <span>min</span>
                  </div>
                </div>
                
                <div className="ejercicios-section">
                  <div className="ejercicios-predefinidos">
                    <label>Ejercicios sugeridos:</label>
                    <div className="ejercicios-chips">
                      {ejerciciosPredefindos.calentamiento.map((ejercicio, index) => (
                        <button
                          key={index}
                          type="button"
                          className="ejercicio-chip"
                          onClick={() => addEjercicioPredefinido('calentamiento', ejercicio)}
                        >
                          + {ejercicio}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="ejercicios-list">
                    {newSession.calentamiento.ejercicios.map((ejercicio, index) => (
                      <div key={index} className="ejercicio-input">
                        <input
                          type="text"
                          value={ejercicio}
                          onChange={(e) => updateEjercicio('calentamiento', index, e.target.value)}
                          placeholder={`Ejercicio ${index + 1}`}
                        />
                        {newSession.calentamiento.ejercicios.length > 1 && (
                          <button
                            type="button"
                            className="remove-ejercicio"
                            onClick={() => removeEjercicio('calentamiento', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-ejercicio"
                      onClick={() => addEjercicio('calentamiento')}
                    >
                      + Añadir ejercicio
                    </button>
                  </div>
                </div>
              </div>

              {/* Parte Principal */}
              <div className="structure-section">
                <div className="section-header">
                  <h6>⚽ Parte Principal</h6>
                  <div className="duration-input">
                    <label>Duración:</label>
                    <input
                      type="number"
                      value={newSession.partePrincipal.duracion}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        partePrincipal: {
                          ...newSession.partePrincipal,
                          duracion: e.target.value
                        }
                      })}
                      min="20"
                      max="120"
                    />
                    <span>min</span>
                  </div>
                </div>
                
                <div className="ejercicios-section">
                  <div className="ejercicios-predefinidos">
                    <label>Ejercicios sugeridos:</label>
                    <div className="ejercicios-chips">
                      {ejerciciosPredefindos[newSession.categoria]?.map((ejercicio, index) => (
                        <button
                          key={index}
                          type="button"
                          className="ejercicio-chip"
                          onClick={() => addEjercicioPredefinido('partePrincipal', ejercicio)}
                        >
                          + {ejercicio}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="ejercicios-list">
                    {newSession.partePrincipal.ejercicios.map((ejercicio, index) => (
                      <div key={index} className="ejercicio-input">
                        <input
                          type="text"
                          value={ejercicio}
                          onChange={(e) => updateEjercicio('partePrincipal', index, e.target.value)}
                          placeholder={`Ejercicio ${index + 1}`}
                        />
                        {newSession.partePrincipal.ejercicios.length > 1 && (
                          <button
                            type="button"
                            className="remove-ejercicio"
                            onClick={() => removeEjercicio('partePrincipal', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-ejercicio"
                      onClick={() => addEjercicio('partePrincipal')}
                    >
                      + Añadir ejercicio
                    </button>
                  </div>
                </div>
              </div>

              {/* Vuelta a la Calma */}
              <div className="structure-section">
                <div className="section-header">
                  <h6>🧘 Vuelta a la Calma</h6>
                  <div className="duration-input">
                    <label>Duración:</label>
                    <input
                      type="number"
                      value={newSession.vueltaCalma.duracion}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        vueltaCalma: {
                          ...newSession.vueltaCalma,
                          duracion: e.target.value
                        }
                      })}
                      min="5"
                      max="30"
                    />
                    <span>min</span>
                  </div>
                </div>
                
                <div className="ejercicios-section">
                  <div className="ejercicios-predefinidos">
                    <label>Ejercicios sugeridos:</label>
                    <div className="ejercicios-chips">
                      {ejerciciosPredefindos.vueltaCalma.map((ejercicio, index) => (
                        <button
                          key={index}
                          type="button"
                          className="ejercicio-chip"
                          onClick={() => addEjercicioPredefinido('vueltaCalma', ejercicio)}
                        >
                          + {ejercicio}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="ejercicios-list">
                    {newSession.vueltaCalma.ejercicios.map((ejercicio, index) => (
                      <div key={index} className="ejercicio-input">
                        <input
                          type="text"
                          value={ejercicio}
                          onChange={(e) => updateEjercicio('vueltaCalma', index, e.target.value)}
                          placeholder={`Ejercicio ${index + 1}`}
                        />
                        {newSession.vueltaCalma.ejercicios.length > 1 && (
                          <button
                            type="button"
                            className="remove-ejercicio"
                            onClick={() => removeEjercicio('vueltaCalma', index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-ejercicio"
                      onClick={() => addEjercicio('vueltaCalma')}
                    >
                      + Añadir ejercicio
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Observaciones</label>
              <textarea
                value={newSession.observaciones}
                onChange={(e) => setNewSession({...newSession, observaciones: e.target.value})}
                placeholder="Observaciones especiales, adaptaciones, etc."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Crear Sesión</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowNewSessionForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Detalles de Sesión */}
      {showSessionDetails && (
        <div className="form-modal">
          <div className="session-details-modal">
            <div className="modal-header">
              <h4>{showSessionDetails.titulo}</h4>
              <button 
                className="close-btn"
                onClick={() => setShowSessionDetails(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="session-overview">
                <div className="overview-item">
                  <strong>Equipo:</strong> {getEquipoNombre(showSessionDetails.equipoId)}
                </div>
                <div className="overview-item">
                  <strong>Categoría:</strong> {getCategoriaInfo(showSessionDetails.categoria).label}
                </div>
                <div className="overview-item">
                  <strong>Intensidad:</strong> {getIntensidadInfo(showSessionDetails.intensidad).label}
                </div>
                <div className="overview-item">
                  <strong>Duración:</strong> {showSessionDetails.duracion} minutos
                </div>
              </div>

              {showSessionDetails.objetivos && (
                <div className="detail-section">
                  <h5>Objetivos</h5>
                  <p>{showSessionDetails.objetivos}</p>
                </div>
              )}

              {showSessionDetails.materialNecesario && (
                <div className="detail-section">
                  <h5>Material Necesario</h5>
                  <p>{showSessionDetails.materialNecesario}</p>
                </div>
              )}

              <div className="detail-section">
                <h5>Estructura de la Sesión</h5>
                
                <div className="session-timeline">
                  <div className="timeline-section">
                    <div className="timeline-header">
                      <h6>🔥 Calentamiento ({showSessionDetails.calentamiento?.duracion || 15} min)</h6>
                    </div>
                    <ul className="ejercicios-timeline">
                      {showSessionDetails.calentamiento?.ejercicios?.map((ejercicio, index) => (
                        <li key={index}>{ejercicio}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="timeline-section">
                    <div className="timeline-header">
                      <h6>⚽ Parte Principal ({showSessionDetails.partePrincipal?.duracion || 60} min)</h6>
                    </div>
                    <ul className="ejercicios-timeline">
                      {showSessionDetails.partePrincipal?.ejercicios?.map((ejercicio, index) => (
                        <li key={index}>{ejercicio}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="timeline-section">
                    <div className="timeline-header">
                      <h6>🧘 Vuelta a la Calma ({showSessionDetails.vueltaCalma?.duracion || 15} min)</h6>
                    </div>
                    <ul className="ejercicios-timeline">
                      {showSessionDetails.vueltaCalma?.ejercicios?.map((ejercicio, index) => (
                        <li key={index}>{ejercicio}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {showSessionDetails.observaciones && (
                <div className="detail-section">
                  <h5>Observaciones</h5>
                  <p>{showSessionDetails.observaciones}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => exportarSesionPDF(showSessionDetails)}
              >
                📄 Exportar PDF
              </button>
              <button className="btn-secondary">Editar Sesión</button>
              <button 
                className="btn-danger"
                onClick={() => {
                  handleDeleteSession(showSessionDetails.id);
                  setShowSessionDetails(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanificacionEntrenamientos;
