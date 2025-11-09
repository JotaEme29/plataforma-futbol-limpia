import React from 'react';
import { FaPlusCircle, FaMinusCircle, FaCommentDots } from 'react-icons/fa';
import './EvaluacionRapida.css';

const EvaluacionRapida = ({ convocados, evaluaciones, onMomentumChange, onNotaChange }) => {

  const getMomentumClass = (momentum) => {
    if (momentum > 0) return 'momentum-positive';
    if (momentum < 0) return 'momentum-negative';
    return 'momentum-neutral';
  };

  return (
    <div className="evaluacion-rapida-container">
      <div className="evaluacion-header">
        <div className="header-jugador">Jugador</div>
        <div className="header-acciones">Acciones Rápidas</div>
        <div className="header-momentum">Momentum</div>
      </div>
      <div className="lista-jugadores-rapida">
        {convocados.map(jugador => {
          const momentum = evaluaciones[jugador.id]?.momentum || 0;

          return (
            <div key={jugador.id} className="jugador-row-rapida">
              <div className="jugador-info-rapida">
                <span className="numero-camiseta">#{jugador.numero_camiseta}</span>
                <span>{jugador.apodo || jugador.nombre}</span>
              </div>
              <div className="acciones-rapidas">
                <button onClick={() => onMomentumChange(jugador.id, 0.5)} className="btn-accion-rapida btn-plus">
                  <FaPlusCircle />
                </button>
                <button onClick={() => onMomentumChange(jugador.id, -0.5)} className="btn-accion-rapida btn-minus">
                  <FaMinusCircle />
                </button>
                <button onClick={() => onNotaChange(jugador.id)} className="btn-accion-rapida btn-nota">
                  <FaCommentDots />
                </button>
              </div>
              <div className="momentum-score">
                <span className={getMomentumClass(momentum)}>{momentum > 0 ? `+${momentum}` : momentum}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvaluacionRapida;
