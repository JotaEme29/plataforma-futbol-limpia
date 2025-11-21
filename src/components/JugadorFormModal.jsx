import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const POSICIONES = [
  "Portero",
  "Defensa Central",
  "Lateral Izquierdo",
  "Lateral Derecho",
  "Carrilero",
  "Líbero",
  "Mediocentro Defensivo",
  "Mediocentro",
  "Volante",
  "Interior",
  "Mediapunta",
  "Extremo Izquierdo",
  "Extremo Derecho",
  "Segundo Delantero",
  "Delantero Centro"
];

const JugadorFormModal = ({ isOpen, onClose, jugador, equipoId }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    posicion: POSICIONES[0], // Default to the first position
    numero_camiseta: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!jugador;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && jugador) {
        setFormData({
          nombre: jugador.nombre || '',
          apellidos: jugador.apellidos || '',
          fecha_nacimiento: jugador.fecha_nacimiento?.toDate ? jugador.fecha_nacimiento.toDate().toISOString().split('T')[0] : '',
          posicion: jugador.posicion || POSICIONES[0],
          numero_camiseta: jugador.numero_camiseta || '',
        });
      } else {
        // Reset form for new player
        setFormData({
          nombre: '',
          apellidos: '',
          fecha_nacimiento: '',
          posicion: POSICIONES[0],
          numero_camiseta: '',
        });
      }
    }
  }, [jugador, isEditing, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.clubId || !equipoId) {
      setError("No se ha podido identificar el club o el equipo.");
      return;
    }
    setLoading(true);
    setError('');

    const dataToSave = {
      ...formData,
      numero_camiseta: parseInt(formData.numero_camiseta, 10),
      fecha_nacimiento: new Date(formData.fecha_nacimiento),
    };

    try {
      if (isEditing) {
        const jugadorRef = doc(db, 'clubes', currentUser.clubId, 'equipos', equipoId, 'jugadores', jugador.id);
        await updateDoc(jugadorRef, dataToSave);
      } else {
        const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', equipoId, 'jugadores');
        await addDoc(jugadoresRef, {
          ...dataToSave,
          fecha_registro: serverTimestamp(),
          total_goles: 0,
          total_asistencias: 0,
          minutos_jugados: 0,
          partidos_jugados: 0,
          suma_valoraciones: 0,
        });
      }
      onClose();
    } catch (err) {
      console.error("Error guardando jugador:", err);
      setError("No se pudo guardar el jugador. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClasses = "w-full p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-black/20 dark:border-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-300/70 focus:border-orange-400 transition-all";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="w-full max-w-md relative rounded-2xl shadow-2xl border border-black/15 bg-gradient-to-br from-orange-500/35 via-amber-400/35 to-sky-500/35 dark:from-orange-500/35 dark:via-amber-400/35 dark:to-sky-500/35"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-black/15 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white drop-shadow">{isEditing ? 'Editar Jugador' : 'Añadir Nuevo Jugador'}</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <IoClose size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && <p className="text-red-100 text-sm bg-red-900/60 p-3 rounded-lg border border-red-400/60">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-1 drop-shadow">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1 drop-shadow">Apellidos</label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className={inputClasses} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1 drop-shadow">Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className={inputClasses} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-1 drop-shadow">Posición</label>
                <select name="posicion" value={formData.posicion} onChange={handleChange} required className={inputClasses}>
                  {POSICIONES.map(pos => (
                    <option key={pos} value={pos} className="bg-white text-gray-900">{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1 drop-shadow">Nº Camiseta</label>
                <input type="number" name="numero_camiseta" value={formData.numero_camiseta} onChange={handleChange} required min="1" max="99" className={inputClasses} />
              </div>
            </div>

            <div className="pt-5 border-t border-black/15 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500/70 via-amber-400/70 to-sky-500/70 rounded-lg border border-black/10 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100">
                {loading ? 'Guardando...' : 'Guardar Jugador'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JugadorFormModal;
