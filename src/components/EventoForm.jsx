import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

const initialFormState = {
  titulo: '',
  tipo: 'partido',
  equipoId: '',
  fecha: '',
  hora: '',
  ubicacion: '',
  descripcion: '',
  equipoRival: '',
  condicion: 'Local',
};

/**
 * Modal de creacion/edicion de eventos.
 * Se limita a recolectar los datos y delega el guardado en el padre via onSave.
 */
function EventoForm({ isOpen, onClose, onSave, eventoToEdit, equipos = [] }) {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (eventoToEdit) {
      const fechaJs = eventoToEdit.fecha?.toDate
        ? eventoToEdit.fecha.toDate()
        : eventoToEdit.fecha
        ? new Date(eventoToEdit.fecha)
        : null;

      setFormData({
        titulo: eventoToEdit.titulo || '',
        tipo: eventoToEdit.tipo || 'partido',
        equipoId: eventoToEdit.equipoId || '',
        fecha: fechaJs ? fechaJs.toISOString().slice(0, 10) : '',
        hora: fechaJs ? fechaJs.toISOString().slice(11, 16) : '',
        ubicacion: eventoToEdit.ubicacion || '',
        descripcion: eventoToEdit.descripcion || '',
        equipoRival: eventoToEdit.equipoRival || '',
        condicion: eventoToEdit.condicion || 'Local',
      });
    } else {
      setFormData(initialFormState);
    }
    setError('');
    setSaving(false);
  }, [eventoToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.fecha || !formData.hora || !formData.equipoId) {
      setError('Completa titulo, equipo, fecha y hora.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    'w-full p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-black/20 dark:border-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-300/70 focus:border-orange-400 transition-all';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-start md:items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="w-full max-w-xl md:max-w-3xl max-h-[92vh] relative rounded-2xl shadow-2xl border border-black/15 bg-gradient-to-br from-orange-500/35 via-amber-400/35 to-sky-500/35 dark:from-orange-500/35 dark:via-amber-400/35 dark:to-sky-500/35 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 border-b border-black/15 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-white drop-shadow">
                {eventoToEdit ? 'Editar evento' : 'Nuevo evento'}
              </h2>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <IoClose size={24} />
              </button>
            </div>

            <form className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto max-h-[82vh]" onSubmit={handleSubmit}>
              {error && (
                <p className="text-red-100 text-sm bg-red-900/60 p-3 rounded-lg border border-red-400/60">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="titulo">
                  Titulo
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Partido vs Rival, Entrenamiento fisico"
                  className={inputClasses}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="tipo">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="partido">Partido</option>
                    <option value="entrenamiento">Entrenamiento</option>
                    <option value="reunion">Reunion</option>
                    <option value="evento_especial">Evento especial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="equipoId">
                    Equipo
                  </label>
                  <select
                    id="equipoId"
                    name="equipoId"
                    value={formData.equipoId}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  >
                    <option value="">Seleccionar equipo</option>
                    {equipos.map((equipo) => (
                      <option key={equipo.id} value={equipo.id} className="bg-white text-gray-900">
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="fecha">
                    Fecha
                  </label>
                  <input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="hora">
                    Hora
                  </label>
                  <input
                    id="hora"
                    name="hora"
                    type="time"
                    value={formData.hora}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="ubicacion">
                  Ubicacion
                </label>
                <input
                  id="ubicacion"
                  name="ubicacion"
                  type="text"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  placeholder="Campo principal, estadio, gimnasio..."
                  className={inputClasses}
                />
              </div>

              {formData.tipo === 'partido' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="equipoRival">
                      Equipo rival
                    </label>
                    <input
                      id="equipoRival"
                      name="equipoRival"
                      type="text"
                      value={formData.equipoRival}
                      onChange={handleChange}
                      placeholder="Nombre del rival"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="condicion">
                      Condicion
                    </label>
                    <select
                      id="condicion"
                      name="condicion"
                      value={formData.condicion}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      <option value="Local">Local</option>
                      <option value="Visitante">Visitante</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white mb-1 drop-shadow" htmlFor="descripcion">
                  Notas
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Objetivos del entrenamiento, detalles logisticos, etc."
                  rows={3}
                  className={`${inputClasses} min-h-[100px]`}
                />
              </div>

              <div className="pt-4 md:pt-5 border-t border-black/15 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500/70 via-amber-400/70 to-sky-500/70 rounded-lg border border-black/10 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                >
                  {saving ? 'Guardando...' : eventoToEdit ? 'Actualizar evento' : 'Crear evento'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EventoForm;
