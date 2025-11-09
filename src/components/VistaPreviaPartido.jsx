// src/components/VistaPreviaPartido.jsx

import React from 'react';
// Importaremos el servicio que ya creamos
import { guardarAlineacion } from '../services/PartidoService'; 

function VistaPreviaPartido({ evento, convocados, onIniciar }) {
  
  // Lógica para manejar el inicio del partido
  const handleIniciarPartido = async () => {
    // Aquí, en el futuro, seleccionaremos titulares y suplentes.
    // Por ahora, para probar, marcaremos a todos los convocados como titulares.
    const titularesIds = convocados.map(j => j.id);
    const suplentesIds = []; // Dejamos el banquillo vacío por ahora

    try {
      // Usamos nuestro servicio para actualizar la alineación y el estado del partido
      await guardarAlineacion(evento.id, titularesIds, suplentesIds);
      
      // Llamamos a la función 'onIniciar' que nos pasó DetalleEvento.jsx
      // para que la interfaz cambie a la vista "en_vivo".
      onIniciar();

    } catch (error) {
      console.error("Error al iniciar el partido:", error);
      alert("No se pudo iniciar el partido. Revisa la consola para más detalles.");
    }
  };

  return (
    <div className="card">
      <h2>Preparación del Partido</h2>
      <p>
        Esta es la vista de preparación. Desde aquí podrás definir la alineación titular, 
        la táctica y dar comienzo al seguimiento en vivo.
      </p>
      <p><strong>Jugadores Convocados:</strong> {convocados.length}</p>
      
      {/* En el futuro, aquí irá el selector de alineación. */}
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={handleIniciarPartido} 
          style={{ padding: '15px 30px', fontSize: '1.2em', backgroundColor: '#4CAF50', color: 'white' }}
        >
          Iniciar Seguimiento en Vivo
        </button>
      </div>
    </div>
  );
}

export default VistaPreviaPartido;
