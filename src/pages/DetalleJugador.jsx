// src/pages/DetalleJugador.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const DetalleJugador = () => {
  const { jugadorId } = useParams();
  const { currentUser } = useAuth();
  const [jugador, setJugador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJugador = async () => {
      if (!currentUser?.clubId) return;

      // La ruta al jugador necesita el ID del equipo, que no tenemos aquí.
      // Este es un placeholder y necesitará ser ajustado con la lógica correcta para encontrar al jugador.
      // Por ahora, mostraremos un mensaje.
      console.log("Buscando jugador con ID:", jugadorId);
      setLoading(false);
    };

    fetchJugador();
  }, [jugadorId, currentUser]);

  if (loading) {
    return <div className="text-center p-8">Cargando datos del jugador...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Perfil del Jugador (ID: {jugadorId})</h1>
      <p className="text-gray-600 dark:text-gray-300">Este componente está en construcción. Aquí se mostrarán las estadísticas detalladas, el historial y la evolución del jugador.</p>
      <Link to="/plantilla" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Volver a la Plantilla</Link>
    </div>
  );
};

export default DetalleJugador;