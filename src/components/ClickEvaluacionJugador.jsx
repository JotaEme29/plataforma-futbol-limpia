import { useState, useEffect, useRef } from 'react';

function ClickEvaluacionJugador({ jugador, evaluacion, onEvalChange, isActive, onSelect }) {
  const [editingStat, setEditingStat] = useState(null);
  const cardRef = useRef(null);

  const notas = {
    tecnica: evaluacion?.tecnica ?? '-',
    fisico: evaluacion?.fisico ?? '-',
    tactica: evaluacion?.tactica ?? '-',
    actitud: evaluacion?.actitud ?? '-',
  };

  useEffect(() => { /* ... (mismo código que antes para cerrar al hacer clic fuera) ... */ }, [cardRef]);

  const handleStatClick = (e, stat) => { /* ... (mismo código que antes) ... */ };
  const handleValueSelect = (stat, value) => { /* ... (mismo código que antes) ... */ };

  return (
    <div
      ref={cardRef}
      className={`eval-jugador-card ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="card-header">
        <span className="player-name">{jugador.nombre} {jugador.apellidos}</span>
      </div>
      <div className="stats-grid">
        {Object.keys(notas).map(key => (
          <div key={key} className="stat-item">
            <span className="stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <div className="stat-value-container" onClick={(e) => handleStatClick(e, key)}>
              <span className="stat-value">{notas[key]}</span>
              {editingStat === key && (
                <div className="quick-selector">
                  {[...Array(11).keys()].map(i => (
                    <div key={i} className="selector-option" onClick={(e) => { e.stopPropagation(); handleValueSelect(key, i); }}>
                      {i}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClickEvaluacionJugador;
