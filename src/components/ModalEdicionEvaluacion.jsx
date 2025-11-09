// src/components/ModalEdicionEvaluacion.jsx

import './ModalEdicionEvaluacion.css'; // Crearemos este archivo CSS

function ModalEdicionEvaluacion({ jugador, evaluacion, onSave, onClose }) {
  // Estado local para manejar los cambios dentro del modal
  const [notas, setNotas] = useState({
    tecnica: evaluacion?.tecnica ?? 5,
    fisico: evaluacion?.fisico ?? 5,
    tactica: evaluacion?.tactica ?? 5,
    actitud: evaluacion?.actitud ?? 5,
  });

  const handleChange = (campo, valor) => {
    const numValor = Math.max(0, Math.min(10, Number(valor))); // Asegura que esté entre 0 y 10
    setNotas(prev => ({ ...prev, [campo]: numValor }));
  };

  const handleGuardar = () => {
    onSave(jugador.id, notas);
    onClose();
  };

  // Evita que el clic dentro del modal lo cierre
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <h4>Ajuste Fino: {jugador.nombre} {jugador.apellidos}</h4>
        <div className="form-edicion">
          {Object.keys(notas).map(categoria => (
            <div className="input-group-modal" key={categoria}>
              <label>{categoria.charAt(0).toUpperCase() + categoria.slice(1)}</label>
              <input
                type="number"
                min="0"
                max="10"
                value={notas[categoria]}
                onChange={(e) => handleChange(categoria, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={handleGuardar} className="btn-primary">Guardar Ajustes</button>
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// Necesitamos importar useState al inicio del archivo
import { useState } from 'react';
export default ModalEdicionEvaluacion;
