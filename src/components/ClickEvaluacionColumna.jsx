import React from 'react';

function ClickEvaluacionColumna({ id, titulo, cantidad, onHeaderClick, children }) {
  const esColumnaDeMovimiento = id !== 'jugadores_pendientes';

  return (
    <div className="eval-columna">
      <div 
        className={`eval-columna-header ${esColumnaDeMovimiento ? 'clickable' : ''}`}
        onClick={esColumnaDeMovimiento ? onHeaderClick : null}
        title={esColumnaDeMovimiento ? `Mover jugador seleccionado a ${titulo}` : ''}
      >
        <h3>{titulo} ({cantidad})</h3>
      </div>
      <div className="eval-columna-body">
        {children}
      </div>
    </div>
  );
}

export default ClickEvaluacionColumna;
