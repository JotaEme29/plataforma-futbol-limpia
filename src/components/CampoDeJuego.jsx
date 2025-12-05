// src/components/CampoDeJuego.jsx

import React from 'react';
import { formaciones, ordenPosiciones } from '../../config/formaciones';
import JugadorEnCampo from './JugadorEnCampo.jsx'; // CORRECCIÓN: Añadida la extensión .jsx
import './CampoDeJuego.css';

const PosicionVacia = ({ posicion }) => {
  return (
    <div
      className="absolute w-10 h-10 rounded-full bg-black/20 border-2 border-dashed border-white/50"
      style={{ top: posicion.top, left: posicion.left, transform: 'translate(-50%, -50%)' }}
    ></div>
  );
};

const CampoDeJuego = ({ 
  titulares = [], 
  formacion = '4-3-3', 
  onJugadorClick = () => {}, 
  jugadorSeleccionadoId = null, 
  tiempoEnCampo = {},
  evaluaciones = {}, // Recibimos las evaluaciones
  onMomentumChange = () => {} // Recibimos la función de cambio
}) => {
  const formacionActual = formaciones[formacion] || formaciones['4-3-3'];
  // Usar el orden definido en ordenPosiciones para asegurar la ubicación correcta
  const ordenTactico = ordenPosiciones[formacion] || Object.keys(formacionActual);
  // Para cada posición táctica, buscar el jugador asignado
  const titularesOrdenados = ordenTactico.map(posKey => titulares.find(j => j.posicionCampo === posKey) || null);
  const jugadoresSinPosicion = titulares.filter(j => !ordenTactico.includes(j.posicionCampo));

  return (
    <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto aspect-[3/4] bg-green-600 dark:bg-green-700 rounded-lg shadow-inner overflow-hidden border-4 border-white/30" style={{ maxHeight: 480 }}>
      {/* Líneas del campo */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30"></div>
      {/* Áreas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-20 border-2 border-white/30 border-t-0 rounded-b-lg"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-20 border-2 border-white/30 border-b-0 rounded-t-lg"></div>
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/30"></div>
      <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/30"></div>
      {/* Esquinas */}
      <div className="absolute top-0 left-0 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-full"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-full"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-full"></div>

      {/* Jugadores en posiciones tácticas, ordenados y vacíos si falta jugador */}
      {ordenTactico.map((posKey, idx) => {
        const jugadorEnPosicion = titulares.find(j => j.posicionCampo === posKey);
        if (jugadorEnPosicion) {
          const tiempoFormateado = tiempoEnCampo[jugadorEnPosicion.id] > 0 
            ? `${Math.floor(tiempoEnCampo[jugadorEnPosicion.id] / 60)}'` 
            : null;
          return (
            <JugadorEnCampo 
              key={posKey} 
              jugador={jugadorEnPosicion} 
              posicion={formacionActual[posKey]} 
              onClick={onJugadorClick}
              isSelected={jugadorEnPosicion.id === jugadorSeleccionadoId}
              tiempoJugado={tiempoFormateado}
              momentum={evaluaciones[jugadorEnPosicion.id]?.momentum || 0}
              onMomentumChange={onMomentumChange}
            />
          );
        } else {
          return <PosicionVacia key={posKey} posicion={formacionActual[posKey]} />;
        }
      })}

      {/* Jugadores sin posición táctica: los mostramos en la parte inferior, distribuidos horizontalmente */}
      {jugadoresSinPosicion.length > 0 && (
        jugadoresSinPosicion.map((jugador, idx) => {
          // Distribuir horizontalmente en la parte inferior
          const leftPercent = 15 + ((70 / (jugadoresSinPosicion.length - 1 || 1)) * idx);
          const posicionExtra = { top: '95%', left: `${leftPercent}%` };
          const tiempoFormateado = tiempoEnCampo[jugador.id] > 0 
            ? `${Math.floor(tiempoEnCampo[jugador.id] / 60)}'` 
            : null;
          return (
            <JugadorEnCampo 
              key={jugador.id} 
              jugador={jugador} 
              posicion={posicionExtra} 
              onClick={onJugadorClick}
              isSelected={jugador.id === jugadorSeleccionadoId}
              tiempoJugado={tiempoFormateado}
              momentum={evaluaciones[jugador.id]?.momentum || 0}
              onMomentumChange={onMomentumChange}
            />
          );
        })
      )}
    </div>
  );
};

export default CampoDeJuego;
