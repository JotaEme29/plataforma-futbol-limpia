// src/components/GraficoMinutosJugados.jsx

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function GraficoMinutosJugados() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTopPlayers = async () => {
      if (!currentUser?.teamId) return;

      const q = query(
        collection(db, 'jugadores'),
        where('teamId', '==', currentUser.teamId),
        orderBy('total_minutos_jugados', 'desc'),
        limit(10) // Mostramos el top 10
      );

      const querySnapshot = await getDocs(q);
      const playersData = querySnapshot.docs.map(doc => doc.data());

      const labels = playersData.map(p => p.apodo || p.nombre);
      const data = playersData.map(p => p.total_minutos_jugados || 0);

      setChartData({
        labels,
        datasets: [{
          label: 'Minutos Jugados',
          data,
          backgroundColor: 'rgba(37, 99, 235, 0.8)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
        }],
      });
      setLoading(false);
    };

    fetchTopPlayers();
  }, [currentUser]);

  const options = {
    indexAxis: 'y', // Esto lo convierte en un gráfico de barras horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 10 Jugadores por Minutos Jugados',
        font: { size: 16 },
        color: '#1a2530',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#4a5568' },
        grid: { color: '#e2e8f0' },
      },
      y: {
        ticks: { color: '#4a5568' },
        grid: { display: false },
      },
    },
  };

  if (loading) return <div className="card"><p>Cargando gráfico de minutos...</p></div>;

  return <Bar options={options} data={chartData} />;
}

export default GraficoMinutosJugados;