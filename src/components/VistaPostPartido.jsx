// src/components/VistaPostPartido.jsx

import React from 'react';

function VistaPostPartido({ evento }) {
  return (
    <div className="card">
      <h2>Partido Finalizado</h2>
      <p>
        El seguimiento en vivo para el partido contra <strong>{evento.descripcion}</strong> ha concluido.
      </p>
      <p>
        En esta vista se mostrará el resumen de estadísticas, el resultado final y la
        parrilla para las valoraciones subjetivas del rendimiento de los jugadores.
      </p>
      {/* Aquí podrías volver a mostrar la parrilla de evaluación que tenías en la versión original */}
    </div>
  );
}

export default VistaPostPartido;
