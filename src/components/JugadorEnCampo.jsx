import React from 'react';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';

// Funcion para determinar el color del momentum
const getMomentumClass = (momentum) => {
  if (momentum > 0) return 'momentum-positive';
  if (momentum < 0) return 'momentum-negative';
  return 'momentum-neutral';
};

// Abrevia posiciones largas para que encajen en la tarjeta
const abreviarPosicion = (pos) => {
  if (!pos) return 'JUG';
  const normalized = pos.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const map = {
    portero: 'POR',
    'defensa central': 'DFC',
    'lateral izquierdo': 'LI',
    'lateral derecho': 'LD',
    carrilero: 'CAR',
    libreo: 'LIB', // cobertura por posible texto mal codificado
    'libero': 'LIB',
    'mediocentro defensivo': 'MCD',
    mediocentro: 'MC',
    volante: 'VOL',
    interior: 'INT',
    mediapunta: 'MP',
    'extremo izquierdo': 'EI',
    'extremo derecho': 'ED',
    'segundo delantero': 'SD',
    'delantero centro': 'DC',
  };
  return map[normalized] || (pos.length > 4 ? pos.slice(0, 3).toUpperCase() : pos.toUpperCase());
};

const JugadorEnCampo = ({
  jugador,
  posicion,
  onClick,
  isSelected,
  tiempoJugado,
  momentum,
  onMomentumChange,
}) => {
  // Esta funcion maneja el clic en los botones de momentum.
  // e.stopPropagation() es muy importante: evita que al hacer clic en '+' o '-',
  // tambien se active el clic para seleccionar al jugador para una sustitucion.
  const handleMomentumClick = (e, cambio) => {
    e.stopPropagation();
    onMomentumChange(jugador.id, cambio);
  };

  const momentumNumber =
    typeof momentum === 'number' ? momentum : parseFloat(momentum || 0);
  const momentumValue =
    momentumNumber > 0 ? `+${momentumNumber.toFixed(1)}` : momentumNumber.toFixed(1);
  const displayName = jugador.apellidos?.trim() || jugador.apodo || jugador.nombre || 'Jugador';
  const displayPos = abreviarPosicion(jugador.posicion);
  const displayNumber = jugador.numero_camiseta || '';

  return (
    <div
      className="absolute flex flex-col items-center text-center transition-all duration-300 group"
      style={{ top: posicion.top, left: posicion.left, transform: 'translate(-50%, -50%)' }}
      onClick={() => onClick(jugador)}
    >
      {tiempoJugado && <div className="player-minutes-chip">{tiempoJugado}</div>}

      <div className={`player-card ${isSelected ? 'selected' : ''}`}>
        <div className="player-card-header">
          <div className="player-card-headings">
            <span className="player-card-name">{displayName}</span>
            <div className="player-card-subline">
              <span className="player-card-position">{displayPos}</span>
              {displayNumber !== '' && <span className="player-card-number-inline">{displayNumber}</span>}
            </div>
          </div>
        </div>

        <div className="player-card-controls">
          <div className={`momentum-display ${getMomentumClass(momentum)}`}>
            <span className="momentum-value">{momentumValue}</span>
          </div>
          <div className="momentum-buttons">
            <button className="eval-btn minus" onClick={(e) => handleMomentumClick(e, -0.5)}>
              <FaMinusCircle />
            </button>
            <button className="eval-btn plus" onClick={(e) => handleMomentumClick(e, 0.5)}>
              <FaPlusCircle />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JugadorEnCampo;
