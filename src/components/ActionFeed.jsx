// src/components/ActionFeed.jsx

import React from 'react';
import './ActionFeed.css'; // Crearemos este archivo CSS después

const mockAcciones = [
  { id: 'a1', minuto: 75, texto: '⚽ Gol de #10 Messi.' },
  { id: 'a2', minuto: 72, texto: '🟨 Amarilla para #4 Ramos.' },
  { id: 'a3', minuto: 68, texto: '🔁 Sustitución: Entra #12 Costa, Sale #9 Suárez.' },
];

function ActionFeed({ acciones = mockAcciones }) {
  return (
    <div className="action-feed-container">
      <h3>En Vivo</h3>
      <div className="feed-list">
        {acciones.length > 0 ? (
          acciones.slice().reverse().map(accion => ( // .slice().reverse() para mostrar la más nueva arriba
            <div key={accion.id} className="feed-item">
              <span className="minuto-feed">{accion.minuto}'</span>
              <span className="texto-feed">{accion.texto}</span>
            </div>
          ))
        ) : (
          <p>El partido no ha comenzado.</p>
        )}
      </div>
    </div>
  );
}

export default ActionFeed;
