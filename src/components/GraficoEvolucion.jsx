// src/components/GraficoEvolucion.jsx

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function GraficoEvolucion({ jugadores = [] }) {
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState('');
  const [datosGrafico, setDatosGrafico] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (jugadores?.length > 0 && !jugadorSeleccionado) {
      setJugadorSeleccionado(jugadores[0].id);
    }
  }, [jugadores, jugadorSeleccionado]);

  useEffect(() => {
    const cargarDatosEvolucion = async () => {
      if (!jugadorSeleccionado) return;
      setLoading(true);

      const q = query(
        collection(db, 'evaluaciones'),
        where('id_jugador', '==', jugadorSeleccionado),
        orderBy('fecha_evento', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const evaluacionesJugador = querySnapshot.docs.map((doc) => doc.data());

      if (evaluacionesJugador.length > 0) {
        const labels = evaluacionesJugador.map((e) =>
          new Date(e.fecha_evento + 'T00:00:00').toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
          })
        );
        const data = evaluacionesJugador.map((e) => {
          const avg =
            ((e.tecnica || 0) + (e.fisico || 0) + (e.tactica || 0) + (e.actitud || 0)) / 4;
          return Number(avg.toFixed(2));
        });

        setDatosGrafico({
          labels,
          datasets: [
            {
              label: 'Valoración promedio',
              data,
              fill: true,
              backgroundColor: 'rgba(22, 163, 74, 0.2)',
              borderColor: 'rgba(22, 163, 74, 1)',
              tension: 0.3,
            },
          ],
        });
      } else {
        setDatosGrafico({ labels: [], datasets: [] });
      }
      setLoading(false);
    };
    cargarDatosEvolucion();
  }, [jugadorSeleccionado]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Evolución de la valoración del jugador',
        font: { size: 16 },
        color: '#1f2933',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { color: '#4b5563' },
        grid: { color: '#e5e7eb' },
      },
      x: {
        ticks: { color: '#4b5563' },
        grid: { display: false },
      },
    },
  };

  return (
    <>
      {jugadores?.length > 0 ? (
        <div className="mb-3">
          <select
            value={jugadorSeleccionado}
            onChange={(e) => setJugadorSeleccionado(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {jugadores.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nombre} {j.apellidos}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay jugadores disponibles</p>
      )}
      <div className="h-64 md:h-80">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Cargando evolución...
          </div>
        ) : datosGrafico.labels.length > 0 ? (
          <Line options={options} data={datosGrafico} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Sin valoraciones registradas para este jugador.
          </div>
        )}
      </div>
    </>
  );
}

export default GraficoEvolucion;

