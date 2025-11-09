// src/components/ClubManagement.jsx - Refactorizado con Tailwind CSS

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function ClubManagement() {
  const { currentUser } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    nombre: '',
    categoria: '',
    formato: '11',
    entrenador: ''
  });

  useEffect(() => {
    if (currentUser?.clubId) {
      loadEquipos();
    }
  }, [currentUser]);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEquipos(equiposData);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      await addDoc(equiposRef, {
        ...newTeam,
        formato: parseInt(newTeam.formato),
        fechaCreacion: serverTimestamp()
      });
      setNewTeam({ nombre: '', categoria: '', formato: '11', entrenador: '' });
      setShowNewTeamForm(false);
      loadEquipos();
    } catch (error) {
      console.error('Error al crear equipo:', error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) {
      try {
        const teamDocRef = doc(db, 'clubes', currentUser.clubId, 'equipos', teamId);
        await deleteDoc(teamDocRef);
        loadEquipos();
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando datos del club...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Equipos del Club ({equipos.length})</h2>
        <button onClick={() => setShowNewTeamForm(true)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">
          <FaPlus /> Nuevo Equipo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipos.map(equipo => (
          <div key={equipo.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{equipo.nombre}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fútbol {equipo.formato}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-blue-500"><FaEdit /></button>
                <button onClick={() => handleDeleteTeam(equipo.id)} className="text-gray-400 hover:text-red-500"><FaTrash /></button>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Categoría:</strong> {equipo.categoria || 'N/A'}</p>
              <p><strong>Entrenador:</strong> {equipo.entrenador || 'No asignado'}</p>
            </div>
          </div>
        ))}
      </div>

      {equipos.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold">No hay equipos registrados</h3>
          <p className="mt-2 text-gray-500">Crea tu primer equipo para empezar a organizar tu club.</p>
        </div>
      )}

      {showNewTeamForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Crear Nuevo Equipo</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Equipo *</label>
                <input
                  type="text"
                  id="nombre"
                  value={newTeam.nombre}
                  onChange={(e) => setNewTeam({ ...newTeam, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                  <input
                    type="text"
                    id="categoria"
                    value={newTeam.categoria}
                    onChange={(e) => setNewTeam({ ...newTeam, categoria: e.target.value })}
                    placeholder="Ej: Sub-19, Senior"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label htmlFor="formato" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Formato *</label>
                  <select
                    id="formato"
                    value={newTeam.formato}
                    onChange={(e) => setNewTeam({ ...newTeam, formato: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 py-2"
                    required
                  >
                    <option value="11">Fútbol 11</option>
                    <option value="9">Fútbol 9</option>
                    <option value="8">Fútbol 8</option>
                    <option value="7">Fútbol 7</option>
                    <option value="5">Fútbol 5</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="entrenador" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entrenador</label>
                <input
                  type="text"
                  id="entrenador"
                  value={newTeam.entrenador}
                  onChange={(e) => setNewTeam({ ...newTeam, entrenador: e.target.value })}
                  placeholder="Nombre del entrenador principal"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewTeamForm(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                  Crear Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClubManagement;