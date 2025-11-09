// src/pages/GestionClubPage.jsx - VERSIÓN MODERNA Y ESTILIZADA

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Asumiremos que crearás estos componentes modales en los siguientes pasos.
// Por ahora, la lógica para abrirlos está comentada para evitar errores.
// import CategoriaFormModal from '../components/CategoriaFormModal';
// import EquipoFormModal from '../components/EquipoFormModal';

const GestionClubPage = () => {
  const { currentUser } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para los modales (actualmente comentados)
  // const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  // const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
  // const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  // const [equipoAEditar, setEquipoAEditar] = useState(null);
  // const [categoriaParaNuevoEquipo, setCategoriaParaNuevoEquipo] = useState(null);

  // Cargar categorías en tiempo real
  useEffect(() => {
    if (!currentUser?.clubId) return;
    const categoriasRef = collection(db, 'clubes', currentUser.clubId, 'categorias');
    const q = query(categoriasRef, orderBy('nombre'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategorias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Error cargando categorías:", err);
      setError("No se pudieron cargar las categorías.");
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Cargar equipos en tiempo real
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

  const getEquiposPorCategoria = (categoriaId) => {
    // CORRECCIÓN: Buscamos en el campo 'categoria' que es donde se está guardando el ID.
    return equipos.filter(equipo => equipo.categoria === categoriaId);
  };

  if (loading) return <p className="text-center p-8">Cargando gestión del club...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Gestión del Club</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Administra las categorías y equipos de tu club.</p>
        </div>
        <button 
          // onClick={() => setIsCategoriaModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Nueva Categoría
        </button>
      </div>

      <div className="space-y-6">
        {categorias.map(categoria => (
          <motion.div 
            key={categoria.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            {/* Encabezado de la Categoría */}
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{categoria.nombre}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Edades: {categoria.edadMinima} - {categoria.edadMaxima} años
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  // onClick={() => { setCategoriaParaNuevoEquipo(categoria.id); setIsEquipoModalOpen(true); }}
                  className="text-sm flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-semibold py-1 px-3 rounded-full hover:bg-green-200"
                >
                  <FaPlus /> Equipo
                </button>
                <button 
                  // onClick={() => { setCategoriaAEditar(categoria); setIsCategoriaModalOpen(true); }}
                  className="btn-card-action text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700"
                >
                  <FaEdit />
                </button>
                <button 
                  // onClick={() => handleDeleteCategoria(categoria.id)}
                  className="btn-card-action text-red-600 hover:bg-red-100 dark:hover:bg-gray-700"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>

            {/* Lista de Equipos */}
            <div className="p-4">
              {getEquiposPorCategoria(categoria.id).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getEquiposPorCategoria(categoria.id).map(equipo => (
                    <div key={equipo.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{equipo.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fútbol {equipo.formato}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          // onClick={() => { setEquipoAEditar(equipo); setIsEquipoModalOpen(true); }}
                          className="btn-card-action text-sm text-blue-600"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          // onClick={() => handleDeleteEquipo(equipo.id)}
                          className="btn-card-action text-sm text-red-600"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No hay equipos en esta categoría. ¡Añade uno!</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Aquí irían los modales. Los he comentado para que no den error
          mientras no existan los archivos.
      <AnimatePresence>
        {isCategoriaModalOpen && (
          <CategoriaFormModal 
            onClose={() => { setIsCategoriaModalOpen(false); setCategoriaAEditar(null); }}
            categoria={categoriaAEditar}
          />
        )}
        {isEquipoModalOpen && (
          <EquipoFormModal 
            onClose={() => { setIsEquipoModalOpen(false); setEquipoAEditar(null); }}
            equipo={equipoAEditar}
            categoriaId={categoriaParaNuevoEquipo}
            categorias={categorias}
          />
        )}
      </AnimatePresence>
      */}
      <style>{`.btn-card-action { padding: 0.5rem; border-radius: 50%; transition: background-color 0.2s; }`}</style>
    </div>
  );
}

export default GestionClubPage;
