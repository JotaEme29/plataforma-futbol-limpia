import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaStar, FaEdit, FaTrashAlt, FaFutbol, FaBullseye, FaFlag } from 'react-icons/fa';

const formatearFechaCorta = (f) => {
  if (!f) return 'Fecha no disponible';
  const d = f?.toDate ? f.toDate() : new Date(f);
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

const CardEvento = ({ evento, onEdit, onDelete }) => {
  const esPartido = evento.tipo === 'partido';
  const stats = evento.estadisticas_partido;
  const haTerminado = evento.evaluado || evento.marcador_local !== undefined;

  const handleEditClick = (e) => {
    e.preventDefault();
    onEdit(evento);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    onDelete(evento.id);
  };

  return (
    <Link to={`/evento/${evento.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1 group">
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start">
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${esPartido ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
            {evento.tipo}
          </span>
          {haTerminado && esPartido && (
            <div className="text-right">
              <p className="text-xl font-black text-gray-700 dark:text-gray-200">
                {evento.marcador_local} - {evento.marcador_visitante}
              </p>
              <p className="text-xs text-gray-500">Resultado Final</p>
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">{evento.titulo}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatearFechaCorta(evento.fecha)}</p>
        {esPartido && evento.equipoRival && <p className="text-sm text-gray-500 dark:text-gray-400">vs {evento.equipoRival}</p>}
      </div>

      {/* Sección de Estadísticas del Partido */}
      {haTerminado && esPartido && stats && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md">
            <div className="stat-item-evento"><FaFutbol className="mr-1"/> Goles: <strong>{stats.goles_local}</strong>- {stats.goles_visitante}</div>
            <div className="stat-item-evento"><FaBullseye className="mr-1"/> Tiros: <strong>{stats.tiros_local}</strong>- {stats.tiros_visitante}</div>
            <div className="stat-item-evento"><FaFlag className="mr-1"/> Córners: <strong>{stats.corners_local}</strong>- {stats.corners_visitante}</div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex justify-between items-center">
        {evento.valoracion_colectiva > 0 ? (
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <FaStar />
            <span className="font-bold text-lg">{evento.valoracion_colectiva.toFixed(1)}</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400">Pendiente</div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={handleEditClick} className="btn-card-action text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700"><FaEdit /></button>
          <button onClick={handleDeleteClick} className="btn-card-action text-red-600 hover:bg-red-100 dark:hover:bg-gray-700"><FaTrashAlt /></button>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1"><FaEye /><span>Ver</span></span>
        </div>
      </div>
      <style>{`
        .btn-card-action { padding: 0.5rem; border-radius: 50%; transition: background-color 0.2s; }
        .stat-item-evento { display: flex; align-items: center; justify-content: center; }
        .stat-item-evento strong { color: #1f2937; margin: 0 2px; }
        .dark .stat-item-evento strong { color: #f9fafb; }
      `}</style>
    </Link>
  );
};

export default CardEvento;