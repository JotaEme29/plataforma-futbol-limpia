// src/components/GraficoEvolucion.jsx

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

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
        collection(db, "evaluaciones"),
        where("id_jugador", "==", jugadorSeleccionado),
        orderBy("fecha_evento", "asc") // Ordenamos del más viejo al más nuevo para la línea de tiempo
      );

      const querySnapshot = await getDocs(q);
      const evaluacionesJugador = querySnapshot.docs.map(doc => doc.data());

      if (evaluacionesJugador.length > 0) {
        const labels = evaluacionesJugador.map(e => new Date(e.fecha_evento + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
        const data = evaluacionesJugador.map(e => {
          const avg = ((e.tecnica || 0) + (e.fisico || 0) + (e.tactica || 0) + (e.actitud || 0)) / 4;
          return avg.toFixed(2);
        });

        setDatosGrafico({
          labels,
          datasets: [{
            label: 'Valoración Promedio',
            data,
            fill: true,
            backgroundColor: 'rgba(22, 163, 74, 0.2)',
            borderColor: 'rgba(22, 163, 74, 1)',
            tension: 0.3,
          }]
        });
      } else {
        // Si no hay datos, mostramos un gráfico vacío
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
        text: 'Evolución de Valoración del Jugador',
        font: { size: 16 },
        color: '#1a2530',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { color: '#4a5568' },
        grid: { color: '#e2e8f0' },
      },
      x: {
        ticks: { color: '#4a5568' },
        grid: { display: false },
      },
    }
  };

  return (
    <>
      {jugadores?.length > 0 ? (
        <select value={jugadorSeleccionado} onChange={(e) => setJugadorSeleccionado(e.target.value)} className="select-dashboard">
          {jugadores.map(j => (
            <option key={j.id} value={j.id}>{j.nombre} {j.apellido}</option>
          ))}
        </select>
      ) : (
        <p className="no-data">No hay jugadores disponibles</p>
      )}
      {loading ? <p>Cargando evolución...</p> : <Line options={options} data={datosGrafico} />}
    </>
  );
}

export default GraficoEvolucion;
