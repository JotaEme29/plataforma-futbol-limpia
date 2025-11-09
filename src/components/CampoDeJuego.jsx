// src/components/CampoDeJuego.jsx

import React from 'react';
import { formaciones } from '../../config/formaciones';
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

  return (
    <div className="relative w-full max-w-xl mx-auto aspect-[3/4] bg-green-600 dark:bg-green-700 rounded-lg shadow-inner overflow-hidden border-4 border-white/30">
        {/* Líneas del campo */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/30"></div> {/* Línea de medio campo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/30"></div> {/* Círculo central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30"></div> {/* Punto central */}

        {/* Áreas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-20 border-2 border-white/30 border-t-0 rounded-b-lg"></div> {/* Área de arriba */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-20 border-2 border-white/30 border-b-0 rounded-t-lg"></div> {/* Área de abajo */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/30"></div> {/* Punto de penalti arriba */}
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/30"></div> {/* Punto de penalti abajo */}

        {/* Esquinas */}
        <div className="absolute top-0 left-0 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-full"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-full"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-full"></div>

        {/* Jugadores */}
        {Object.entries(formacionActual).map(([posKey, posCoords]) => {
          const jugadorEnPosicion = titulares.find(j => j.posicionCampo === posKey);
          if (jugadorEnPosicion) {
            const tiempoFormateado = tiempoEnCampo[jugadorEnPosicion.id] > 0 
              ? `${Math.floor(tiempoEnCampo[jugadorEnPosicion.id] / 60)}'` 
              : null;

            return (
              <JugadorEnCampo 
                key={posKey} 
                jugador={jugadorEnPosicion} 
                posicion={posCoords} 
                onClick={onJugadorClick} // La función que se ejecuta al hacer clic en la tarjeta
                isSelected={jugadorEnPosicion.id === jugadorSeleccionadoId}
                tiempoJugado={tiempoFormateado}
                momentum={evaluaciones[jugadorEnPosicion.id]?.momentum || 0}
                onMomentumChange={onMomentumChange} // La función para los botones +/-
              />
            );
          } else {
            return <PosicionVacia key={posKey} posicion={posCoords} />;
          }
        })}
    </div>
  );
};

export default CampoDeJuego;
