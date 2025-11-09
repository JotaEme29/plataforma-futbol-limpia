// src/components/CampoFutbol.jsx

import React from 'react';
import FichaJugador from './FichaJugador';
import './CampoFutbol.css'; // Crearemos este archivo CSS después

// Datos de ejemplo para la alineación
const mockTitulares = [
  { id: 'j1', dorsal: 1, nombre: 'García', energia: 95, posicion: { top: '85%', left: '50%' } },
  { id: 'j2', dorsal: 4, nombre: 'Ramos', energia: 92, posicion: { top: '70%', left: '30%' } },
  { id: 'j3', dorsal: 5, nombre: 'Piqué', energia: 94, posicion: { top: '70%', left: '70%' } },
  { id: 'j4', dorsal: 10, nombre: 'Messi', energia: 88, posicion: { top: '20%', left: '50%' } },
  // ...Añadir más jugadores para una alineación 4-3-3 o la que prefieras
];

const mockSuplentes = [
  { id: 's1', dorsal: 12, nombre: 'Costa', energia: 100 },
  { id: 's2', dorsal: 23, nombre: 'Alves', energia: 100 },
];

function CampoFutbol({ titulares = mockTitulares, suplentes = mockSuplentes }) {
  return (
    <div className="campo-container">
      <div className="campo-futbol">
        {/* Renderizamos los jugadores titulares en sus posiciones */}
        {titulares.map(jugador => (
          <div key={jugador.id} className="posicion-jugador" style={jugador.posicion}>
            <FichaJugador jugador={jugador} />
          </div>
        ))}
      </div>
      <div className="banquillo">
        <h3>Banquillo</h3>
        <div className="suplentes-container">
          {suplentes.map(jugador => (
            <FichaJugador key={jugador.id} jugador={jugador} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CampoFutbol;
