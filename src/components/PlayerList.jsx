// src/components/PlayerList.jsx

function PlayerList({ jugadores, activarEdicion, borrarJugador }) {
  return (
    <div>
      <h1>Mi Plantilla de Jugadores</h1>
      <hr style={{ borderColor: '#444' }} />
      
      {jugadores.map(jugador => (
        <div key={jugador.id} style={{ border: '1px solid #444', background: '#333742', borderRadius: '8px', padding: '20px', margin: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{jugador.dorsal || '-'}. {jugador.nombre} {jugador.apellidos}</h2>
            <p><strong>Posición:</strong> {jugador.posicion}</p>
            
            {/* Contenedor para las estadísticas */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px', color: '#ccc' }}>
              <span><strong>Goles:</strong> {jugador.total_goles || 0}</span>
              <span><strong>Asistencias:</strong> {jugador.total_asistencias || 0}</span>
              <span><strong>Minutos Jugados:</strong> {jugador.total_minutos_jugados || 0}</span>
              <span><strong>Convocatorias:</strong> {jugador.total_convocatorias || 0}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => activarEdicion(jugador)} className="btn btn-icon" title="Editar jugador" aria-label="Editar jugador">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
            </button>
            <button onClick={() => borrarJugador(jugador.id)} className="btn btn-icon btn-danger" title="Eliminar jugador" aria-label="Eliminar jugador">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-9 0v-.5A1.5 1.5 0 0110.5 5h3A1.5 1.5 0 0115 6.5V7m-7 0v11a2 2 0 002 2h4a2 2 0 002-2V7"/></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlayerList;
