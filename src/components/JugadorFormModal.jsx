import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const JugadorFormModal = ({ isOpen, onClose, jugador, equipoId }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    posicion: '',
    numero_camiseta: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!jugador;

  useEffect(() => {
    if (isEditing && jugador) {
      setFormData({
        nombre: jugador.nombre || '',
        apellidos: jugador.apellidos || '',
        fecha_nacimiento: jugador.fecha_nacimiento?.toDate ? jugador.fecha_nacimiento.toDate().toISOString().split('T')[0] : '',
        posicion: jugador.posicion || '',
        numero_camiseta: jugador.numero_camiseta || '',
      });
    } else {
      // Reset form for new player
      setFormData({
        nombre: '',
        apellidos: '',
        fecha_nacimiento: '',
        posicion: '',
        numero_camiseta: '',
      });
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
      onClose(); // Cierra el modal al guardar con éxito
    } catch (err) {
      console.error("Error guardando jugador:", err);
      setError("No se pudo guardar el jugador. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">{isEditing ? 'Editar Jugador' : 'Añadir Nuevo Jugador'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="input-form" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos</label>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="input-form" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="input-form" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Posición</label>
                <input type="text" name="posicion" value={formData.posicion} onChange={handleChange} required className="input-form" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nº Camiseta</label>
                <input type="number" name="numero_camiseta" value={formData.numero_camiseta} onChange={handleChange} required min="1" max="99" className="input-form" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar Jugador'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      <style>{`
        .input-form {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          background-color: white;
        }
        .dark .input-form {
          background-color: #374151;
          border-color: #4b5563;
          color: white;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default JugadorFormModal;