// src/components/PlayerForm.jsx

import { useState, useEffect } from 'react';
import Modal from 'react-modal';

// Estilos para el modal usando clases de Tailwind (aplicados al contenedor del modal)
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    background: 'transparent',
    padding: 0,
    overflow: 'visible',
    width: '90%',
    maxWidth: '600px',
  },
  overlay: {
    backgroundColor: 'rgba(17, 24, 39, 0.75)', // bg-gray-900 con opacidad
    zIndex: 50,
  },
};

// Vincula el modal a tu app (importante para la accesibilidad)
Modal.setAppElement('#root');

const PlayerForm = ({ isOpen, onClose, onSave, jugadorExistente, equipos }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    apodo: '',
    posicion: '',
    equipoId: '', // Nuevo campo
    numero_camiseta: '',
  });

  // Efecto para rellenar el formulario cuando se edita un jugador
  useEffect(() => {
    if (isOpen) {
      if (jugadorExistente) {
        setFormData({
          nombre: jugadorExistente.nombre || '',
          apellidos: jugadorExistente.apellidos || '',
          apodo: jugadorExistente.apodo || '',
          posicion: jugadorExistente.posicion || '',
          equipoId: jugadorExistente.equipoId || '',
          numero_camiseta: jugadorExistente.numero_camiseta || '',
        });
      } else {
        setFormData({ nombre: '', apellidos: '', apodo: '', posicion: '', equipoId: '', numero_camiseta: '' });
      }
    }
  }, [jugadorExistente, isOpen]); // Se ejecuta cuando cambia el jugador o se abre/cierra el modal

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, numero_camiseta: Number(formData.numero_camiseta) };
    if (!jugadorExistente && !dataToSave.equipoId) {
      alert("Debes seleccionar un equipo para el nuevo jugador.");
      return; // Evita que el formulario se cierre
    }
    onSave(dataToSave);
  };

  const posiciones = [
    'Portero',
    'Defensa Central',
    'Lateral Derecho',
    'Lateral Izquierdo',
    'Mediocentro Defensivo',
    'Mediocentro',
    'Volante',
    'Mediocentro Ofensivo',
    'Extremo Derecho',
    'Extremo Izquierdo',
    'Delantero Centro',
    'Mediapunta'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Formulario de Jugador"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {jugadorExistente ? 'Editar Jugador' : 'Añadir Nuevo Jugador'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
              <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos</label>
              <input type="text" name="apellidos" id="apellidos" value={formData.apellidos} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
            </div>
          </div>
          <div>
            <label htmlFor="apodo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apodo (Opcional)</label>
            <input type="text" name="apodo" id="apodo" value={formData.apodo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
          </div>
          {/* Permitir asignar/cambiar de equipo */}
          {(jugadorExistente || equipos?.length > 0) && (
            <div>
              <label htmlFor="equipoId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asignar a Equipo *</label>
              <select name="equipoId" id="equipoId" value={formData.equipoId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 py-2">
                <option value="">Selecciona un equipo</option>
                {equipos?.map(equipo => <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="posicion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Posición</label>
              <select name="posicion" id="posicion" value={formData.posicion} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 py-2">
                <option value="">Selecciona una posición</option>
                {posiciones.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="numero_camiseta" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dorsal</label>
              <input type="number" name="numero_camiseta" id="numero_camiseta" value={formData.numero_camiseta} onChange={handleChange} required min="1" max="99" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
            </div>
          </div>
          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              {jugadorExistente ? 'Actualizar Jugador' : 'Guardar Jugador'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PlayerForm;