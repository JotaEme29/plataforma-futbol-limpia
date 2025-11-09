// src/pages/Eventos.jsx - Refactorizado con Tailwind CSS

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase'; // Asegúrate que la ruta a firebase es correcta
import { collection, query, orderBy, addDoc, onSnapshot, Timestamp, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import EventoForm from '../components/EventoForm'; // Asegúrate de tener este componente
import CardEvento from '../components/CardEvento'; // Importamos la nueva tarjeta
import { FaPlus } from 'react-icons/fa';

function Eventos() {
  const [eventos, setEventos] = useState([]); // Estado para la lista de eventos
  const [equipos, setEquipos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventoAEditar, setEventoAEditar] = useState(null);
  const [filtroEquipo, setFiltroEquipo] = useState('todos'); // Estado para el nuevo filtro
  const [estadisticas, setEstadisticas] = useState({
    pj: 0, pg: 0, pe: 0, pp: 0,
    gf: 0, gc: 0, dg: 0
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
    const stats = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0 };
    
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
  }; // <-- PARÉNTESIS CORREGIDO

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-2 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
            Eventos
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Planifica y visualiza todos los partidos y entrenamientos.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenForm()} 
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <FaPlus />
          <span className="hidden sm:inline">Crear Evento</span>
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg"
        >
          <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
        </motion.div>
      )}

      {/* --- INICIO: Nuevo Filtro de Equipos por Cápsulas (MOVIDO ARRIBA) --- */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <span className="text-sm font-semibold mr-2">Filtrar por equipo:</span>
        <button
          onClick={() => setFiltroEquipo('todos')}
          className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-200 border-2 ${
            filtroEquipo === 'todos'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          Todos
        </button>
        {equipos.map(equipo => (
          <button
            key={equipo.id}
            onClick={() => setFiltroEquipo(equipo.id)}
            className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-200 border-2 ${
              filtroEquipo === equipo.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {equipo.nombre}
          </button>
        ))}
      </div>

      {/* --- INICIO: Sección de Resumen de Estadísticas --- */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Resumen General de Partidos</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
            <StatCard label="PJ" value={estadisticas.pj} />
            <StatCard label="PG" value={estadisticas.pg} color="green" />
            <StatCard label="PE" value={estadisticas.pe} color="yellow" />
            <StatCard label="PP" value={estadisticas.pp} color="red" />
            <StatCard label="GF" value={estadisticas.gf} />
            <StatCard label="GC" value={estadisticas.gc} />
            <StatCard label="DG" value={estadisticas.dg} color={estadisticas.dg > 0 ? 'green' : estadisticas.dg < 0 ? 'red' : 'yellow'} />
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-4">
              <FaPlus className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">No hay eventos programados.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Crea tu primer evento para comenzar.</p>
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
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    default: 'text-gray-800 dark:text-gray-200'
  };
  return (
    <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
      <div className={`text-2xl font-black ${colorClasses[color] || colorClasses.default}`}>{value}</div>
      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{label}</div>
    </div>
  );
};

export default Eventos;
