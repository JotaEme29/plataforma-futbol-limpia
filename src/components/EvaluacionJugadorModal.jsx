import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import './EvaluacionJugadorModal.css';

const CriterioEvaluacion = ({ titulo, valor, onCambio }) => {
  return (
    <div className="criterio-evaluacion">
      <label>{titulo}</label>
      <div className="stars-container">
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1;
          return (
            <FaStar
              key={i}
              className="star"
              color={ratingValue <= valor ? '#ffc107' : '#e4e5e9'}
              onClick={() => onCambio(ratingValue)}
            />
          );
        })}
      </div>
    </div>
  );
};

const EvaluacionJugadorModal = ({ jugador, evaluacion, onCerrar, onGuardar }) => {
  const [datosEvaluacion, setDatosEvaluacion] = React.useState(evaluacion);

  const handleCambioCriterio = (categoria, criterio, valor) => {
    setDatosEvaluacion(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [criterio]: valor,
      },
    }));
  };

  const handleGuardar = () => {
    onGuardar(jugador.id, datosEvaluacion);
  };

  const categorias = {
    tecnica: ['Control', 'Dribbling', 'Pase', 'Tiro'],
    tactica: ['Posicionamiento', 'Toma de Decisiones', 'Lectura de Juego'],
    fisico: ['Velocidad', 'Resistencia', 'Fuerza'],
    actitud: ['Esfuerzo', 'Trabajo en Equipo', 'Disciplina'],
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Evaluación de {jugador.nombre} {jugador.apellidos}</h2>
          <button onClick={onCerrar} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="stats-resumen">
            <p><strong>Minutos:</strong> {datosEvaluacion.minutos_jugados || 0}'</p>
            <p><strong>Goles:</strong> {datosEvaluacion.goles || 0}</p>
            <p><strong>Asistencias:</strong> {datosEvaluacion.asistencias || 0}</p>
          </div>

          {Object.entries(categorias).map(([cat, crit]) => (
            <div key={cat} className="categoria-evaluacion">
              <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
              <div className="criterios-grid">
                {crit.map(criterio => (
                  <CriterioEvaluacion
                    key={criterio}
                    titulo={criterio}
                    valor={datosEvaluacion[cat]?.[criterio] || 0}
                    onCambio={(valor) => handleCambioCriterio(cat, criterio, valor)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="comentarios-seccion">
            <h3>Comentarios Generales</h3>
            <textarea
              rows="3"
              placeholder="Añade tus observaciones sobre el rendimiento del jugador..."
              value={datosEvaluacion.comentarios || ''}
              onChange={(e) => setDatosEvaluacion(prev => ({ ...prev, comentarios: e.target.value }))}
            ></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onCerrar} className="btn-secondary">Cancelar</button>
          <button onClick={handleGuardar} className="btn-primary">Guardar Evaluación</button>
        </div>
      </div>
    </div>
  );
};

export default EvaluacionJugadorModal;
