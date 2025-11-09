import React from 'react';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';

// Función para determinar el color del momentum
const getMomentumClass = (momentum) => {
  if (momentum > 0) return 'momentum-positive';
  if (momentum < 0) return 'momentum-negative';
  return 'momentum-neutral';
};

const JugadorEnCampo = ({ jugador, posicion, onClick, isSelected, tiempoJugado, momentum, onMomentumChange }) => {
  
  // Esta función maneja el clic en los botones de momentum.
  // e.stopPropagation() es muy importante: evita que al hacer clic en '+' o '-', 
  // también se active el clic para seleccionar al jugador para una sustitución.
  const handleMomentumClick = (e, cambio) => {
    e.stopPropagation(); 
    onMomentumChange(jugador.id, cambio);
  };

  return (
    <div
      className="absolute flex flex-col items-center text-center transition-all duration-300 group"
      style={{ top: posicion.top, left: posicion.left, transform: 'translate(-50%, -50%)' }}
      onClick={() => onClick(jugador)}
    >
      {/* Tiempo jugado */}
      {tiempoJugado && (
        <div className="absolute -top-4 z-20 bg-black bg-opacity-70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          {tiempoJugado}
        </div>
      )}

      {/* Contenedor principal del jugador */}
      <div className={`player-card ${isSelected ? 'selected' : ''}`}>
        <div className="player-card-info">
          <span className="player-card-number">#{jugador.numero_camiseta || '?'}</span>
          <span className="player-card-name">{jugador.apodo || jugador.nombre}</span>
        </div>
        
        {/* Controles de Evaluación Rápida */}
        <div className="player-card-controls">
          <button className="eval-btn minus" onClick={(e) => handleMomentumClick(e, -0.5)}>
            <FaMinusCircle />
          </button>
          <span className={`momentum-display ${getMomentumClass(momentum)}`}>{momentum > 0 ? `+${momentum}` : momentum}</span>
          <button className="eval-btn plus" onClick={(e) => handleMomentumClick(e, 0.5)}>
            <FaPlusCircle />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JugadorEnCampo;