import React from 'react';
import { FaEdit, FaTrashAlt, FaFutbol, FaRunning, FaStar, FaHandshake, FaRegCalendarCheck, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '?';
  const hoy = new Date();
  const cumple = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }
  return edad;
};

const CardJugador = ({ jugador, onEdit, onDelete, onVerGrafico }) => {
  const edad = calcularEdad(jugador.fecha_nacimiento?.toDate());

  // --- ¡NUEVO! ---
  // Calculamos la valoración media. Si no hay partidos, la valoración es 0.
  const valoracionMedia = (jugador.partidos_jugados > 0)
    ? (jugador.suma_valoraciones / jugador.partidos_jugados).toFixed(1)
    : 'N/A';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{jugador.apodo || `${jugador.nombre} ${jugador.apellidos || ''}`}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{jugador.posicion}</p>
          </div>
          <div className="text-3xl font-black text-gray-300 dark:text-gray-600">
            {jugador.numero_camiseta || '#'}
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{jugador.equipoNombre}</p>
      </div>

      {/* Estadísticas */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => onVerGrafico(jugador)} className="w-full flex flex-col items-center justify-center text-center mb-3 group hover:scale-105 transition-transform">
          <div className="relative">
            <div className="flex items-center justify-center gap-1">
              <FaStar className="text-amber-400 text-2xl mb-1" />
              <span className="text-4xl font-black text-amber-500 dark:text-amber-400">{valoracionMedia}</span>
            </div>
            <FaChartLine className="absolute -right-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors" />
          </div>
          <span className="stat-label font-semibold mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Valoración Media</span>
        </button>
        <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-200 dark:border-gray-600 pt-3">
          <div className="stat-item">
            <FaRegCalendarCheck className="stat-icon text-gray-400" />
            <span className="stat-value">{jugador.partidos_jugados || 0}</span>
            <span className="stat-label">Partidos</span>
          </div>
          <div className="stat-item">
            <FaRunning className="stat-icon text-gray-400" />
            <span className="stat-value">{jugador.minutos_jugados || 0}'</span>
            <span className="stat-label">Minutos</span>
          </div>
          <div className="stat-item">
            <FaFutbol className="stat-icon text-gray-400" />
            <span className="stat-value">{jugador.total_goles || 0}</span>
            <span className="stat-label">Goles</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="p-3 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800">
        <button onClick={() => onEdit(jugador)} className="btn-card-action text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700">
          <FaEdit />
        </button>
        <button onClick={() => onDelete(jugador.id)} className="btn-card-action text-red-600 hover:bg-red-100 dark:hover:bg-gray-700">
          <FaTrashAlt />
        </button>
      </div>
      <style>{`
        .stat-item-main { display: flex; flex-direction: column; align-items: center; }
        .stat-item { display: flex; flex-direction: column; align-items: center; }
        .stat-icon { font-size: 1.1rem; margin-bottom: 2px; }
        .stat-value { font-size: 1rem; font-weight: 700; line-height: 1.2; }
        .stat-label { font-size: 0.65rem; text-transform: uppercase; color: #6b7280; }
        .dark .stat-label { color: #9ca3af; }
        .btn-card-action { padding: 0.5rem; border-radius: 50%; transition: background-color 0.2s; }
      `}</style>
    </div>
  );
};

export default CardJugador;