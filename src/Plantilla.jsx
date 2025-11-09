// src/pages/Plantilla.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion'; // 1. Importar motion
import CardJugador from '../components/CardJugador';
import { FaPlus } from 'react-icons/fa';

function Plantilla() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar los equipos del club
  useEffect(() => {
    if (!currentUser?.clubId) return;

    const loadEquipos = async () => {
      try {
        const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
        const equiposSnapshot = await getDocs(equiposRef);
        const equiposData = equiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEquipos(equiposData);
        // Seleccionar el primer equipo por defecto
        if (equiposData.length > 0) {
          setSelectedTeam(equiposData[0].id);
        }
      } catch (err) {
        console.error("Error al cargar equipos:", err);
        setError("No se pudieron cargar los equipos.");
      }
    };

    loadEquipos();
  }, [currentUser]);

  // Cargar los jugadores del equipo seleccionado
  useEffect(() => {
    if (!selectedTeam || !currentUser?.clubId) {
      setJugadores([]);
      setLoading(false);
      return;
    }

    const loadJugadores = async () => {
      setLoading(true);
      try {
        const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', selectedTeam, 'jugadores');
        const q = query(jugadoresRef, orderBy('numero_camiseta', 'asc'));
        const jugadoresSnapshot = await getDocs(q);
        const jugadoresData = jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJugadores(jugadoresData);
      } catch (err) {
        console.error("Error al cargar jugadores:", err);
        setError("No se pudieron cargar los jugadores de este equipo.");
      } finally {
        setLoading(false);
      }
    };

    loadJugadores();
  }, [selectedTeam, currentUser]);

  // 2. Definir las variantes para la animación del contenedor y los ítems
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Tiempo entre la animación de cada tarjeta
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plantilla de Jugadores</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestiona y visualiza los miembros de tus equipos.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {equipos.length > 1 && (
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full md:w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {equipos.map(equipo => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          )}
          <button className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
            <FaPlus />
            <span className="hidden sm:inline">Añadir Jugador</span>
          </button>
        </div>
      </div>

      {/* Grid de jugadores */}
      {loading && <p className="text-center text-gray-500 dark:text-gray-400">Cargando jugadores...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && jugadores.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No hay jugadores en este equipo</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Haz clic en "Añadir Jugador" para empezar a construir tu plantilla.</p>
        </div>
      )}
      {!loading && jugadores.length > 0 && (
        // 3. Aplicar las variantes al contenedor del grid
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {jugadores.map(jugador => (
            // 4. Envolver cada tarjeta en un motion.div para animarla individualmente
            <motion.div key={jugador.id} variants={itemVariants}>
              <CardJugador jugador={jugador} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default Plantilla;
