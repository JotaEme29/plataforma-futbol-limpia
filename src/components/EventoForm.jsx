// src/components/EventoForm.jsx

import { useState } from 'react';
import Modal from 'react-modal';

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
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    zIndex: 50,
  },
};

Modal.setAppElement('#root');

const EventoForm = ({ isOpen, onClose, onSave, equipos }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'entrenamiento',
    equipoId: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    equipoRival: '',
    condicion: 'Local',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const tiposEvento = ['entrenamiento', 'partido', 'reunion', 'evento_especial'];

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel="Formulario de Evento">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Crear Nuevo Evento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título del Evento *</label>
            <input type="text" name="titulo" id="titulo" value={formData.titulo} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo *</label>
              <select name="tipo" id="tipo" value={formData.tipo} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 py-2 capitalize">
                {tiposEvento.map(tipo => <option key={tipo} value={tipo}>{tipo.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="equipoId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Equipo *</label>
              <select name="equipoId" id="equipoId" value={formData.equipoId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 py-2">
                <option value="">Selecciona un equipo</option>
                {equipos.map(equipo => <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha *</label>
              <input type="date" name="fecha" id="fecha" value={formData.fecha} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label htmlFor="hora" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora *</label>
              <input type="time" name="hora" id="hora" value={formData.hora} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
            </div>
          </div>

          {formData.tipo === 'partido' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="equipoRival" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Equipo Rival</label>
                <input type="text" name="equipoRival" id="equipoRival" value={formData.equipoRival} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700" />
              </div>
              <div>
                <label htmlFor="condicion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condición</label>
                <select name="condicion" id="condicion" value={formData.condicion} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 py-2">
                  <option value="Local">Local</option>
                  <option value="Visitante">Visitante</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              Crear Evento
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EventoForm;