// src/components/FichaJugador.jsx

import React from 'react';
import './FichaJugador.css'; // Crearemos este archivo CSS después

function FichaJugador({ jugador }) {
  // Datos de ejemplo si no se proporciona un jugador
  const displayJugador = jugador || {
    dorsal: '10',
    nombre: 'Pérez',
    energia: 85, // Un valor de 0 a 100
    estado: {
      amarilla: false,
      roja: false,
    }
  };

  const energiaColor = displayJugador.energia > 60 ? '#4CAF50' : displayJugador.energia > 30 ? '#FFC107' : '#F44336';

  return (
    <div className="ficha-jugador">
      <div className="dorsal">{displayJugador.dorsal}</div>
      <div className="nombre">{displayJugador.nombre}</div>
      <div className="barra-energia-container">
        <div 
          className="barra-energia" 
          style={{ width: `${displayJugador.energia}%`, backgroundColor: energiaColor }}
        ></div>
      </div>
      <div className="iconos-estado">
        {displayJugador.estado.amarilla && <span className="icono-tarjeta amarilla">🟨</span>}
        {displayJugador.estado.roja && <span className="icono-tarjeta roja">🟥</span>}
      </div>
    </div>
  );
}

export default FichaJugador;
