// src/components/CentroMandoPartido.jsx

import React from 'react';
import CampoFutbol from './CampoFutbol';
import ActionFeed from './ActionFeed';
import './CentroMandoPartido.css'; // Crearemos este archivo CSS después

function CentroMandoPartido() {
  return (
    <div className="centro-mando">
      <div className="panel-superior">
        <div className="marcador">
          <span>TU EQUIPO</span>
          <span className="resultado">0 - 0</span>
          <span>RIVAL</span>
        </div>
        <div className="cronometro">
          <span>00:00</span>
          <div className="controles-crono">
            <button>▶</button>
            <button>❚❚</button>
          </div>
        </div>
      </div>

      <div className="panel-principal">
        <div className="zona-tactica">
          <CampoFutbol />
        </div>
        <div className="zona-acciones">
          <div className="botones-accion-rapida">
            <button>GOL</button>
            <button>ASIST.</button>
            <button>FALTA</button>
            <button>TARJETA</button>
            {/* ... más botones */}
          </div>
          <ActionFeed />
        </div>
      </div>
    </div>
  );
}

export default CentroMandoPartido;
