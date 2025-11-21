// src/pages/Eventos.jsx - Refactorizado con Tailwind CSS
// src/pages/Eventos.jsx - Refactorizado con Tailwind CSS

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase'; // Asegúrate que la ruta a firebase es correcta
import { collection, query, orderBy, addDoc, onSnapshot, Timestamp, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import EventoForm from '../components/EventoForm'; // Asegúrate de tener este componente
import CardEvento from '../components/CardEvento'; // Importamos la nueva tarjeta
import { FaPlus, FaFutbol, FaChartBar, FaFilter } from 'react-icons/fa';

function Eventos() {
  const [eventos, setEventos] = useState([]); // Estado para la lista de eventos
  const [equipos, setEquipos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventoAEditar, setEventoAEditar] = useState(null);
  const [filtroEquipo, setFiltroEquipo] = useState('todos'); // Estado para el nuevo filtro
  const [estadisticas, setEstadisticas] = useState({
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    pts: 0,
    gf: 0,
    gc: 0,
    dg: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Efecto para cargar los equipos del club.
  useEffect(() => {
    if (!currentUser?.clubId) return;
    const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
    const q = query(equiposRef, orderBy('nombre'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEquipos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Error cargando equipos: ", err);
      setError("No se pudieron cargar los equipos.");
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Efecto para cargar los eventos en tiempo real.
  useEffect(() => {
    if (!currentUser?.clubId) return;

    setLoading(true);
    const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
    const q = query(eventosRef, orderBy('fecha', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaEventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(listaEventos);
      setLoading(false);
    }, (err) => {
      console.error("Error cargando eventos: ", err);
      setError("No se pudieron cargar los eventos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filtra los eventos a mostrar basado en el filtro seleccionado
  const eventosFiltrados = eventos.filter(evento => {
    return filtroEquipo === 'todos' || evento.equipoId === filtroEquipo;
  });

  // --- INICIO: Lógica de cálculo de estadísticas (AHORA DINÁMICA) ---
  useEffect(() => {
    const stats = { pj: 0, pg: 0, pe: 0, pp: 0, pts: 0, gf: 0, gc: 0, dg: 0 };
    
    // Usamos 'eventosFiltrados' para que las stats respondan al filtro
    eventosFiltrados
      .filter(e => e.tipo === 'partido' && e.evaluado)
      .forEach(partido => {
        stats.pj++;
        const golesLocal = partido.marcador_local || 0;
        const golesVisitante = partido.marcador_visitante || 0;

        if (partido.condicion === 'Local') {
          stats.gf += golesLocal;
          stats.gc += golesVisitante;
          if (golesLocal > golesVisitante) stats.pg++;
          else if (golesLocal < golesVisitante) stats.pp++;
          else stats.pe++;
        } else { // Visitante
          stats.gf += golesVisitante;
          stats.gc += golesLocal;
          if (golesVisitante > golesLocal) stats.pg++;
          else if (golesVisitante < golesLocal) stats.pp++;
          else stats.pe++;
        }
      });

    stats.dg = stats.gf - stats.gc;
    stats.pts = stats.pg * 3 + stats.pe;
    setEstadisticas(stats);

  }, [eventos, filtroEquipo]); // CORRECCIÓN: Depende de los datos reales, no de la variable recalculada.
  // --- FIN: Lógica de cálculo ---

  const handleSaveEvent = async (formData) => {
    if (!currentUser?.clubId) {
      setError("No se pudo identificar el club.");
      return;
    }
    try {
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}`);
      const dataToSave = { 
        ...formData, 
        fecha: Timestamp.fromDate(fechaHora) 
      };

      if (eventoAEditar) {
        // Modo Edición
        const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoAEditar.id);
        await updateDoc(eventoRef, dataToSave);
      } else {
        // Modo Creación
        const eventosRef = collection(db, 'clubes', currentUser.clubId, 'eventos');
        await addDoc(eventosRef, {
          ...dataToSave,
          creadoPor: currentUser.uid,
          estado: 'programado',
        });
      }
      handleCloseForm();
    } catch (err) {
      console.error("Error al crear evento:", err);
      setError("No se pudo guardar el evento.");
    }
  };

  const handleDeleteEvent = async (eventoId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.")) {
      try {
        const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
        await deleteDoc(eventoRef);
      } catch (err) {
        console.error("Error al eliminar evento:", err);
        setError("No se pudo eliminar el evento.");
      }
    }
  };

  // Abre el modal, opcionalmente con un evento para editar.
  const handleOpenForm = (evento = null) => {
    setEventoAEditar(evento);
    setIsFormOpen(true);
  };

  // Cierra el modal y resetea el estado de edición.
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEventoAEditar(null);
  };

  // Renderizado condicional mientras cargan los datos.
  if (loading) return <p className="text-center p-8">Cargando...</p>;
  
  const tacticalBackgroundStyle = {
    backgroundImage: `
      repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.02) 0px,
        rgba(255, 255, 255, 0.02) 1px,
        transparent 1px,
        transparent 20px
      ),
      repeating-linear-gradient(
        -45deg,
        rgba(255, 255, 255, 0.02) 0px,
        rgba(255, 255, 255, 0.02) 1px,
        transparent 1px,
        transparent 20px
      )
    `, 
    backgroundSize: '20px 20px',
  };

  return (
    <div className="space-y-8 overflow-x-hidden" style={tacticalBackgroundStyle}>
      {/* Encabezado glass oscuro tipo DashboardClub */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-2xl shadow-lg shadow-black/25 border border-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
            <FaFutbol className="text-4xl text-blue-400 drop-shadow-lg" />
            Eventos del Club
          </h1>
          <p className="text-black text-sm md:text-base">Planifica y visualiza todos los partidos y entrenamientos</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenForm()} 
          className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-base font-bold bg-white/10 text-driblab-text shadow-xl hover:scale-105 transition-transform duration-300 border-2 border-black/60 self-start sm:self-auto ml-auto"
          disabled={loading}
        >
          <FaPlus className="text-2xl text-blue-400 drop-shadow" /> Nuevo Evento
        </motion.button>
        {/* overlays glass */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8" />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-driblab-accent/70 via-blue-400 to-purple-500 p-6 rounded-2xl shadow-xl"
        >
          <p className="text-red-300 font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Filtro de Equipos glass oscuro tipo DashboardClub */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg shadow-black/25 border border-black/40">
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <span className="text-sm font-bold text-white mr-2 flex items-center gap-2">
            <FaFilter className="text-driblab-accent text-lg" />
            Filtrar por equipo:
          </span>
          <button
            onClick={() => setFiltroEquipo('todos')}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 border ${
              filtroEquipo === 'todos'
                ? 'bg-black text-white shadow-lg border-black scale-[1.02]'
                : 'bg-white/10 text-driblab-text border-black/60 hover:bg-white/20'
            }`}
          >
            <FaChartBar className="text-blue-400" /> Todos
          </button>
          {equipos.map(equipo => (
            <button
              key={equipo.id}
              onClick={() => setFiltroEquipo(equipo.id)}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 border ${
                filtroEquipo === equipo.id
                  ? 'bg-black text-white shadow-lg border-black scale-[1.02]'
                  : 'bg-white/10 text-driblab-text border-black/60 hover:bg-white/20'
              }`}
            >
              <FaFutbol className="text-blue-400" /> {equipo.nombre}
            </button>
          ))}
        </div>
        {/* overlays glass */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-6 -mt-6" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white opacity-10 rounded-full -ml-4 -mb-4" />
      </div>

      {/* Estadísticas Mejoradas */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 backdrop-blur-xl border border-black/40 p-4 sm:p-6 rounded-2xl shadow-lg shadow-black/25"
        >
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-white flex items-center gap-2 sm:gap-3">
              <FaChartBar className="text-2xl sm:text-3xl text-driblab-accent" />
              Resumen General de Partidos
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4 text-center">
              <StatCard label="PJ" value={estadisticas.pj} />
              <StatCard label="PG" value={estadisticas.pg} color="green" />
              <StatCard label="PE" value={estadisticas.pe} color="yellow" />
              <StatCard label="PP" value={estadisticas.pp} color="red" />
              <StatCard label="PTS" value={estadisticas.pts} />
              <StatCard label="GF" value={estadisticas.gf} />
              <StatCard label="GC" value={estadisticas.gc} />
              <StatCard label="DG" value={estadisticas.dg} color={estadisticas.dg > 0 ? 'green' : estadisticas.dg < 0 ? 'red' : 'yellow'} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Contenedor del Grid para las tarjetas de evento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventosFiltrados.map(evento => (
          <CardEvento 
            key={evento.id} 
            evento={evento} 
            onEdit={handleOpenForm} 
            onDelete={handleDeleteEvent} 
          />
        ))}
      </div>
        {/* Mensaje si no hay eventos */}
        {eventosFiltrados.length === 0 && !loading && (
          <div className="text-center py-12 bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg shadow-black/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-driblab-dark mb-4">
              <FaPlus className="text-2xl text-driblab-accent" />
            </div>
            <p className="text-driblab-text font-semibold">No hay eventos programados.</p>
            <p className="text-sm text-driblab-subtle mt-1">Crea tu primer evento para comenzar.</p>
          </div>
        )}
      
      {/* Modal para crear/editar eventos */}
      <EventoForm
        isOpen={isFormOpen} // El modal se abre si isFormOpen es true
        onClose={handleCloseForm}
        onSave={handleSaveEvent}
        eventoToEdit={eventoAEditar} // Pasamos el evento a editar
        equipos={equipos}
      />
    </div>
  );
}

// Componente interno para las tarjetas de estadísticas
const StatCard = ({ label, value, color }) => {
  const highlightColors = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  };

  const colorClass = color ? highlightColors[color] : 'text-driblab-text';

  return (
    <div className="bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 backdrop-blur-xl p-3 sm:p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:bg-white/20 border border-white/20 shadow-xl">
      <div className={`text-2xl sm:text-3xl font-black text-white drop-shadow-lg mb-0.5 sm:mb-1 ${colorClass.replace('text-driblab-text','')}`}>{value}</div>
      <div className="text-[10px] sm:text-xs text-black font-bold uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">{label}</div>
    </div>
  );
};

export default Eventos;
