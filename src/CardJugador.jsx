// src/components/CardJugador.jsx

import { Link } from 'react-router-dom';
import { FaFutbol, FaAssistiveListeningSystems, FaRegClock } from 'react-icons/fa';

const getPosicionClass = (posicion) => {
  switch (posicion?.toLowerCase()) {
    case 'portero':
      return 'bg-yellow-500 text-white';
    case 'defensa':
      return 'bg-blue-500 text-white';
    case 'mediocentro':
      return 'bg-green-500 text-white';
    case 'delantero':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

function CardJugador({ jugador }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Encabezado de la tarjeta */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-4">
        <div className="flex-shrink-0 w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300">
          {jugador.numero_camiseta || '#'}
        </div>
        <div className="flex-grow">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={`${jugador.nombre} ${jugador.apellidos}`}>
            {jugador.apodo || `${jugador.nombre} ${jugador.apellidos}`}
          </h4>
          <p className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getPosicionClass(jugador.posicion)}`}>
            {jugador.posicion || 'Sin posición'}
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="p-4 grid grid-cols-3 gap-4 text-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <FaFutbol className="text-blue-500 mb-1" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{jugador.total_goles || 0}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Goles</span>
        </div>
        <div className="flex flex-col items-center">
          <FaAssistiveListeningSystems className="text-green-500 mb-1" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{jugador.total_asistencias || 0}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Asist.</span>
        </div>
        <div className="flex flex-col items-center">
          <FaRegClock className="text-red-500 mb-1" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{jugador.minutos_jugados || 0}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Minutos</span>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <Link to={`/jugador/${jugador.id}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          Ver Perfil
        </Link>
      </div>
    </div>
  );
}

export default CardJugador;
