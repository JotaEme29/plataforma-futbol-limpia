import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { IoStar, IoFootball, IoWalk, IoPeople, IoAnalytics, IoAdd } from 'react-icons/io5';
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
import { useAuth } from '../hooks/useAuth';
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

  // Cargar jugadores del equipo seleccionado
  useEffect(() => {
    if (!currentUser?.clubId || !equipoSeleccionado) {
      setJugadores([]);
      return;
    }

    setLoading(true);
    const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', equipoSeleccionado, 'jugadores');
    const q = query(jugadoresRef, orderBy('numero_camiseta', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaJugadores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJugadores(listaJugadores);
      setLoading(false);
    }, (err) => {
      console.error("Error al cargar jugadores:", err);
      setError("No se pudieron cargar los jugadores.");
      setLoading(false);
    });

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

  const handleDeletePlayer = async (jugadorId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar a este jugador?")) {
      console.log("Eliminar jugador:", jugadorId);
    }
  };

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
    const values = data.map(j => {
      if (dataKey === 'valoracionMedia') {
        return Number((j.suma_valoraciones / j.partidos_jugados).toFixed(1));
      }
      return j[dataKey] || 0;
    });

    const maxValue = values.length ? Math.max(...values) : 0;
    const stepSize = maxValue <= 5 ? 1 : Math.ceil(maxValue / 4);
    const suggestedMax = maxValue === 0 ? 1 : Math.ceil(maxValue + stepSize);

    const chartData = {
      labels: data.map(j => j.apodo || j.nombre),
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor: chartColor,
          borderColor: chartColor,
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };

    const chartOptions = {
      indexAxis: 'y',
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
          suggestedMax,
          ticks: { color: '#e5e7eb', stepSize, precision: 0 },
          grid: { color: 'rgba(255,255,255,0.14)', drawBorder: false, lineWidth: 1 }
        },
        y: {
          ticks: { color: '#e5e7eb' },
          grid: { display: false }
        },
      },
      };

      return (
        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-4 rounded-2xl shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,white,transparent_60%),radial-gradient(circle_at_bottom_right,white,transparent_60%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <h3 className="text-md font-semibold text-white flex items-center gap-3">
              {icon}
              {title}
            </h3>
            <div className="h-56 relative bg-black/20 rounded-xl border border-white/20 p-3">
              {data.length > 0 ? (
                <Bar options={chartOptions} data={chartData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <IoAnalytics className="text-4xl text-gray-400 mb-3" />
                  <p className="text-center text-sm text-driblab-subtle font-semibold">
                    No hay datos suficientes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

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
      {/* Encabezado con estilo Eventos */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-2xl shadow-lg shadow-black/25 border border-black/50">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
            <h1 className="text-3xl font-bold text-white mb-1">Plantilla de Jugadores</h1>
            <p className="text-black text-sm md:text-base">
              Gestiona y analiza el rendimiento de tus jugadores
            </p>
            </div>
          <button
              onClick={() => handleOpenModal()}
            className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-base font-bold bg-white/10 text-white shadow-lg shadow-black/25 hover:scale-105 transition-transform duration-300 border-2 border-black/50"
            >
            <IoAdd className="text-xl text-blue-400" />
            Añadir Jugador
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8" />
      </div>

      {/* Filtro de equipos con estilo de Eventos */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg shadow-black/25 border border-black/50">
        <div className="flex flex-wrap items-center gap-3 relative z-10">
            <span className="text-sm font-bold text-white mr-2 flex items-center gap-2">
              <IoPeople className="text-driblab-accent text-lg" />
            Seleccionar Equipo:
            </span>
          {equipos.map(equipo => (
            <button
              key={equipo.id}
              onClick={() => setEquipoSeleccionado(equipo.id)}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 border ${
                equipoSeleccionado === equipo.id
                  ? 'bg-black text-white shadow-lg border-black scale-[1.02]'
                  : 'bg-white/10 text-driblab-text border-black/60 hover:bg-white/20'
              }`}
            >
              {equipo.nombre}
            </button>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-6 -mt-6" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-4 -mb-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankingChartCard
          title="Top 5 Goleadores"
          data={topGoleadores}
          dataKey="total_goles"
          icon={<IoFootball className="text-green-400 text-xl" />}
          chartColor="rgba(74, 222, 128, 0.8)"
        />
        <RankingChartCard
          title="Top 5 Valoraciones"
          data={topValoraciones}
          dataKey="valoracionMedia"
          icon={<IoStar className="text-yellow-400 text-xl" />}
          chartColor="rgba(250, 204, 21, 0.8)"
        />
        <RankingChartCard
          title="Top 5 Minutos Jugados"
          data={topMinutos}
          dataKey="minutos_jugados"
          dataSuffix="'"
          icon={<IoWalk className="text-purple-400 text-xl" />}
          chartColor="rgba(192, 132, 252, 0.8)"
        />
      </div>

      {loading && <p>Cargando jugadores...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {jugadores.map(jugador => (
          <CardJugador
            key={jugador.id}
            jugador={jugador}
            onEdit={handleOpenModal}
            onVerGrafico={() => alert(`Mostrar gráfico para ${jugador.nombre}`)}
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
