import React from 'react';
import { Link } from 'react-router-dom';
import {
  IoEye,
  IoStar,
  IoPencil,
  IoTrash,
  IoFootball,
  IoWalk,
  IoTime,
  IoAnalytics,
} from 'react-icons/io5';

const formatearFechaCorta = (f) => {
  if (!f) return 'Fecha no disponible';
  const d = f?.toDate ? f.toDate() : new Date(f);
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

const CardEvento = ({ evento, onEdit, onDelete }) => {
  const esPartido = evento.tipo === 'partido';
  const stats = evento.estadisticas_partido;
  const haTerminado = evento.evaluado || evento.marcador_local !== undefined;

  let resultado = null;
  if (
    esPartido &&
    haTerminado &&
    typeof evento.marcador_local === 'number' &&
    typeof evento.marcador_visitante === 'number'
  ) {
    const golesLocal = evento.marcador_local;
    const golesVisitante = evento.marcador_visitante;
    const diferencia =
      evento.condicion === 'Local'
        ? golesLocal - golesVisitante
        : golesVisitante - golesLocal;

    if (diferencia > 0) resultado = 'victoria';
    else if (diferencia < 0) resultado = 'derrota';
    else resultado = 'empate';
  }

  const resultadoClasses =
    resultado === 'victoria'
      ? 'border-l-green-500'
      : resultado === 'empate'
      ? 'border-l-yellow-500'
      : resultado === 'derrota'
      ? 'border-l-red-500'
      : 'border-l-gray-700';

  const handleEditClick = (e) => {
    e.preventDefault();
    onEdit(evento);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    onDelete(evento.id);
  };

  return (
    <Link
      to={`/evento/${evento.id}`}
      className={`group relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-2xl shadow-xl shadow-black/25 flex flex-col transition-all duration-300 hover:-translate-y-1 border border-black/40 border-l-4 ${resultadoClasses}`}
    >
      <div className="flex-grow relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`text-xs font-semibold uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-2 ${
              esPartido ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/30' : 'bg-green-600 text-white shadow-lg shadow-green-900/30'
            }`}
          >
            {esPartido ? (
              <>
                <IoFootball className="text-white text-lg drop-shadow" /> Partido
              </>
            ) : (
              <>
                <IoWalk className="text-white text-lg" /> Entrenamiento
              </>
            )}
          </span>
          {haTerminado && esPartido && (
            <div className="text-right bg-white/10 px-3 py-1.5 rounded-lg shadow-lg border border-white/30">
              <p className="text-2xl font-black text-white drop-shadow">
                {evento.marcador_local} - {evento.marcador_visitante}
              </p>
              <p className="text-sm text-white font-semibold drop-shadow">Resultado</p>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-black mt-1 text-white drop-shadow-lg group-hover:text-blue-50 transition-colors flex items-center gap-2">
          <IoAnalytics className="text-purple-200 text-2xl drop-shadow" />
          {evento.titulo}
        </h3>
        <p className="text-sm text-black font-semibold mt-1 flex items-center gap-2">
          <IoTime className="text-blue-300" />
          {formatearFechaCorta(evento.fecha)}
        </p>
        {esPartido && evento.equipoRival && (
          <p className="text-sm text-black font-semibold mt-1 flex items-center gap-2">
            <IoFootball className="text-blue-300" />
            vs {evento.equipoRival}
          </p>
        )}
      </div>

      {haTerminado && esPartido && stats && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white/15 backdrop-blur-xl p-3 rounded-xl border border-white/20 text-white">
            <div className="stat-item-evento flex flex-col items-center gap-1">
              <IoFootball className="text-emerald-200 text-lg" />
              <span className="text-white font-bold">
                {stats.goles_local}-{stats.goles_visitante}
              </span>
              <span className="text-white text-xs">Goles</span>
            </div>
            <div className="stat-item-evento flex flex-col items-center gap-1">
              <IoAnalytics className="text-blue-200 text-lg" />
              <span className="text-white font-bold">
                {stats.tiros_local}-{stats.tiros_visitante}
              </span>
              <span className="text-white text-xs">Tiros</span>
            </div>
            <div className="stat-item-evento flex flex-col items-center gap-1">
              <IoStar className="text-amber-300 text-lg" />
              <span className="text-white font-bold">
                {stats.corners_local}-{stats.corners_visitante}
              </span>
              <span className="text-white text-xs">Córners</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 px-4 py-3 flex justify-between items-center border-t border-white/10">
        {evento.valoracion_colectiva > 0 ? (
          <div className="flex items-center gap-2 bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-purple-900/40 border border-purple-100/50">
            <IoStar className="text-yellow-200 drop-shadow" />
            <span className="font-black text-base text-white drop-shadow">{evento.valoracion_colectiva.toFixed(1)}</span>
          </div>
        ) : (
          <div className="text-xs text-white font-medium bg-black/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <IoTime className="text-white" />
            Pendiente
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleEditClick}
            className="p-2 rounded-lg text-white hover:bg-white/15 transition-colors duration-150"
          >
            <IoPencil />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg text-white hover:bg-white/15 transition-colors duration-150"
          >
            <IoTrash />
          </button>
          <span className="text-xs font-semibold text-white group-hover:underline flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            <IoEye />
            <span>Ver</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CardEvento;
