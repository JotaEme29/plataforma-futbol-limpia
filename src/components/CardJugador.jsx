import React from 'react';
import {
  IoPencil,
  IoTrash,
  IoFootballOutline,
  IoWalkOutline,
  IoStarOutline,
  IoCalendarOutline,
} from 'react-icons/io5';

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

  const valoracionMedia =
    jugador.partidos_jugados > 0
      ? (jugador.suma_valoraciones / jugador.partidos_jugados).toFixed(1)
      : 'N/A';

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-4 lg:p-5 rounded-2xl shadow-xl shadow-black/25 flex flex-col transition-all duration-300 hover:-translate-y-1 border border-black/40">
      {/* Glow suave similar a CardEvento */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,white,transparent_60%),radial-gradient(circle_at_bottom_right,white,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col gap-2 lg:gap-3">
        {/* Encabezado jugador */}
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className="text-base lg:text-lg font-extrabold text-white truncate leading-tight">
              {jugador.apodo || `${jugador.nombre} ${jugador.apellidos || ''}`}
            </h3>
            <p className="text-xs text-black font-semibold flex items-center gap-2">
              <IoFootballOutline className="text-emerald-600" />
              {jugador.posicion || 'Sin posicion'}
            </p>
            {jugador.fecha_nacimiento && (
              <p className="mt-0.5 text-xs text-black font-semibold flex items-center gap-2">
                <IoCalendarOutline className="text-blue-600" />
                {edad} años
              </p>
            )}
          </div>
          <div className="flex flex-col items-center rounded-lg px-2.5 py-1 bg-black/20 border border-white/20">
            <span className="text-xs text-white uppercase tracking-wide">
              N°
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-white leading-none">
              {jugador.numero_camiseta || '#'}
            </span>
          </div>
        </div>

        {/* Valoracion media destacada */}
        <button
          onClick={() => onVerGrafico(jugador)}
          className="w-full flex flex-col items-center justify-center text-center p-2 lg:p-3 rounded-xl bg-white/20 border border-black/15 hover:bg-white/30 transition-colors duration-200"
        >
          <div className="flex items-center justify-center gap-2">
            <IoStarOutline className="text-amber-500 text-xl lg:text-2xl" />
            <span className="text-xl lg:text-2xl font-extrabold text-white leading-tight">
              {valoracionMedia}
            </span>
          </div>
          <span className="text-[11px] lg:text-xs font-bold text-black mt-1 uppercase tracking-wide">
            Valoracion media
          </span>
        </button>

        {/* Estadisticas rapidas */}
        <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
          <StatItem value={jugador.partidos_jugados || 0} label="Partidos" />
          <StatItem value={`${jugador.minutos_jugados || 0}'`} label="Minutos" />
          <StatItem value={jugador.total_goles || 0} label="Goles" />
        </div>
      </div>

      {/* Acciones inferiores, alineadas con estilo de CardEvento */}
      <div className="mt-3 lg:mt-4 bg-white/5 px-2.5 py-2 lg:px-3 lg:py-2.5 flex justify-end items-center gap-1.5 border-t border-white/10 relative z-10">
        <button
          onClick={() => onEdit(jugador)}
          className="p-1.5 lg:p-2 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors duration-150"
        >
          <IoPencil className="text-base lg:text-lg" />
        </button>
        <button
          onClick={() => onDelete(jugador.id)}
          className="p-1.5 lg:p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors duration-150"
        >
          <IoTrash className="text-base lg:text-lg" />
        </button>
      </div>
    </div>
  );
};

const StatItem = ({ value, label }) => {
  let icon = null;
  if (label === 'Partidos') {
    icon = <IoCalendarOutline className="text-blue-600 text-base lg:text-lg" />;
  } else if (label === 'Minutos') {
    icon = <IoWalkOutline className="text-purple-600 text-base lg:text-lg" />;
  } else if (label === 'Goles') {
    icon = <IoFootballOutline className="text-emerald-600 text-base lg:text-lg" />;
  } else {
    icon = <span className="text-gray-600 text-base lg:text-lg">?</span>;
  }

  return (
    <div className="flex flex-col items-center p-1.5 lg:p-2 rounded-lg bg-white/80 border border-black/10">
      {icon}
      <span className="text-sm lg:text-md font-extrabold text-black leading-tight">{value}</span>
      <span className="text-[10px] lg:text-[11px] text-black uppercase font-bold tracking-wide">
        {label}
      </span>
    </div>
  );
};

export default CardJugador;
