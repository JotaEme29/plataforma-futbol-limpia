import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { FaStar, FaFutbol, FaRunning } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import CardJugador from '../components/CardJugador';
import JugadorFormModal from '../components/JugadorFormModal'; // Asumo que tienes un modal para crear/editar

const Plantilla = () => {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');

  // --- REGISTRO DE COMPONENTES DE CHART.JS ---
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jugadorAEditar, setJugadorAEditar] = useState(null);

  // Cargar equipos del club
  useEffect(() => {
    if (!currentUser?.clubId) return;

    const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
    const q = query(equiposRef, orderBy('nombre'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaEquipos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEquipos(listaEquipos);
      if (listaEquipos.length > 0 && !equipoSeleccionado) {
        setEquipoSeleccionado(listaEquipos[0].id);
      }
    }, (err) => {
      console.error("Error al cargar equipos:", err);
      setError("No se pudieron cargar los equipos.");
    });

    return () => unsubscribe();
  }, [currentUser, equipoSeleccionado]);

  // --- ¡LA CLAVE ESTÁ AQUÍ! ---
  // Cargar jugadores del equipo seleccionado CON ESCUCHA EN TIEMPO REAL
  useEffect(() => {
    if (!currentUser?.clubId || !equipoSeleccionado) {
      setJugadores([]);
      return;
    }

    setLoading(true);
    const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', equipoSeleccionado, 'jugadores');
    const q = query(jugadoresRef, orderBy('numero_camiseta', 'asc'));

    // onSnapshot crea un listener que actualiza 'jugadores' automáticamente
    // cada vez que hay un cambio en la base de datos.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaJugadores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJugadores(listaJugadores);
      setLoading(false);
    }, (err) => {
      console.error("Error al cargar jugadores:", err);
      setError("No se pudieron cargar los jugadores.");
      setLoading(false);
    });

    // La función de limpieza se ejecuta cuando el componente se desmonta
    // o cuando cambia el equipo seleccionado, cerrando la conexión anterior.
    return () => unsubscribe();

  }, [currentUser, equipoSeleccionado]);

  const handleOpenModal = (jugador = null) => {
    setJugadorAEditar(jugador);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setJugadorAEditar(null);
  };

  // Lógica para eliminar jugador (deberías tenerla implementada)
  const handleDeletePlayer = async (jugadorId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar a este jugador?")) {
      // Aquí iría tu lógica para eliminar el documento del jugador de Firestore
      console.log("Eliminar jugador:", jugadorId);
    }
  };

  // --- INICIO: Lógica para los rankings Top 5 ---
  const topGoleadores = [...jugadores]
    .sort((a, b) => (b.total_goles || 0) - (a.total_goles || 0))
    .slice(0, 5);

  const topValoraciones = [...jugadores]
    .filter(j => j.partidos_jugados > 0)
    .sort((a, b) => {
      const valoracionA = a.suma_valoraciones / a.partidos_jugados;
      const valoracionB = b.suma_valoraciones / b.partidos_jugados;
      return valoracionB - valoracionA;
    })
    .slice(0, 5);

  const topMinutos = [...jugadores]
    .sort((a, b) => (b.minutos_jugados || 0) - (a.minutos_jugados || 0))
    .slice(0, 5);

  const RankingChartCard = ({ title, data, dataKey, dataSuffix = '', icon, chartColor }) => {
    const chartData = {
      labels: data.map(j => j.apodo || j.nombre),
      datasets: [
        {
          label: title,
          data: data.map(j => {
            if (dataKey === 'valoracionMedia') {
              return (j.suma_valoraciones / j.partidos_jugados).toFixed(1);
            }
            return j[dataKey] || 0;
          }),
          backgroundColor: chartColor,
          borderColor: chartColor,
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      indexAxis: 'y', // Esto hace el gráfico de barras horizontal
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.x}${dataSuffix}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        },
        y: {
          ticks: { color: '#9ca3af' },
          grid: { display: false }
        },
      },
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
          {icon}
          {title}
        </h3>
        <div className="h-64 relative">
          {data.length > 0 ? <Bar options={chartOptions} data={chartData} /> : <p className="text-center text-xs text-gray-500 pt-20">No hay datos suficientes.</p>}
        </div>
      </div>
    );
  };
  // --- FIN: Lógica para los rankings Top 5 ---

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Plantilla de Jugadores</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + Añadir Jugador
        </button>
      </div>

      {/* --- INICIO: Nuevo Filtro de Equipos por Cápsulas --- */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold mr-2">Equipos:</span>
        {equipos.map(equipo => (
          <button
            key={equipo.id}
            onClick={() => setEquipoSeleccionado(equipo.id)}
            className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-200 border-2 ${
              equipoSeleccionado === equipo.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {equipo.nombre}
          </button>
        ))}
      </div>

      {/* --- INICIO: Sección de Rankings --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankingChartCard title="Top 5 Goleadores" data={topGoleadores} dataKey="total_goles" icon={<FaFutbol className="text-green-500" />} chartColor="rgba(34, 197, 94, 0.6)" />
        <RankingChartCard title="Top 5 Valoraciones" data={topValoraciones} dataKey="valoracionMedia" icon={<FaStar className="text-amber-500" />} chartColor="rgba(245, 158, 11, 0.6)" />
        <RankingChartCard title="Top 5 Minutos Jugados" data={topMinutos} dataKey="minutos_jugados" dataSuffix="'" icon={<FaRunning className="text-purple-500" />} chartColor="rgba(168, 85, 247, 0.6)" />
      </div>

      {loading && <p>Cargando jugadores...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {jugadores.map(jugador => (
          <CardJugador
            key={jugador.id}
            jugador={jugador}
            onEdit={handleOpenModal}
            onVerGrafico={() => alert(`Mostrar gráfico para ${jugador.nombre}`)} // Placeholder para la funcionalidad del gráfico
            onDelete={handleDeletePlayer}
          />
        ))}
      </div>

      {isModalOpen && (
        <JugadorFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          jugador={jugadorAEditar}
          equipoId={equipoSeleccionado}
        />
      )}
    </div>
  );
};

export default Plantilla;