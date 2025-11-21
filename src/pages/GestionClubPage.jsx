// src/pages/GestionClubPage.jsx - GESTIÓN SIMPLIFICADA DE EQUIPOS

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { FaPlus, FaTrashAlt, FaUsers, FaFutbol, FaEdit, FaClipboardList, FaTimes, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const GestionClubPage = () => {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    formato: '11'
  });

  useEffect(() => {
    if (equipos.length >= 1 && showForm) {
      setShowForm(false);
    }
  }, [equipos, showForm]);

  useEffect(() => {
    if (!currentUser?.clubId) return;
    setLoading(true);
    const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
    const q = query(equiposRef, orderBy('nombre'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEquipos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error cargando equipos:", err);
      setError("No se pudieron cargar los equipos.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (equipos.length >= 1) {
      alert('En esta prueba solo puedes crear y gestionar un equipo.');
      return;
    }
    try {
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      await addDoc(equiposRef, {
        ...formData,
        fechaCreacion: serverTimestamp(),
        activo: true
      });
      setFormData({ nombre: '', categoria: '', formato: '11' });
      setShowForm(false);
    } catch (err) {
      console.error("Error al crear equipo:", err);
      alert("Error al crear el equipo");
    }
  };

  const handleDelete = async (equipoId) => {
    if (!window.confirm('¿Eliminar este equipo? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDoc(doc(db, 'clubes', currentUser.clubId, 'equipos', equipoId));
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar el equipo");
    }
  };

  if (loading) return <p className="text-center p-8">Cargando gestión del club...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Gestión de Equipos</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Administra los equipos de tu club de forma eficiente</p>
        </div>
        <button 
          onClick={() => equipos.length >= 1 ? alert('En esta prueba solo puedes crear y gestionar un equipo.') : setShowForm(!showForm)}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          disabled={equipos.length >= 1}
        >
          <FaPlus />
          {showForm ? 'Cancelar' : 'Nuevo Equipo'}
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-2xl font-black mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <FaFutbol className="text-3xl text-blue-600" />
            Crear Nuevo Equipo
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FaEdit className="text-blue-600" />
                Nombre del Equipo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="ej: Cadete A, Juvenil B"
                className="w-full px-4 py-3 border-2 rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                placeholder="ej: Infantil, Cadete, Juvenil"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Formato de Fútbol *</label>
              <select
                value={formData.formato}
                onChange={(e) => setFormData({...formData, formato: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="5">Fútbol 5</option>
                <option value="7">Fútbol 7</option>
                <option value="8">Fútbol 8</option>
                <option value="9">Fútbol 9</option>
                <option value="11">Fútbol 11</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <FaCheck />
              Crear Equipo
            </button>
          </form>
        </motion.div>
      )}

      {equipos.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <FaUsers className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">No hay equipos registrados</h3>
          <p className="text-gray-500 dark:text-gray-400">Crea tu primer equipo para comenzar</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipos.map(equipo => (
          <motion.div 
            key={equipo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-400"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                  <FaFutbol className="text-blue-600" />
                  {equipo.nombre}
                </h3>
                {equipo.categoria && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mt-1 flex items-center gap-2">
                    <FaClipboardList className="text-purple-600" />
                    {equipo.categoria}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(equipo.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <FaTrashAlt className="text-lg" />
              </button>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FaUsers className="text-blue-600 dark:text-blue-400" />
                Formato: Fútbol {equipo.formato}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default GestionClubPage;
