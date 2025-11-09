// src/pages/GestionRolesPage.jsx - PÁGINA DEDICADA PARA GESTIÓN DE ROLES

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // Esta línea ya era correcta, pero la verifico.
import GestionRoles from '../components/GestionRoles';
import { FaLock, FaUserShield, FaPlus } from 'react-icons/fa';

function GestionRolesPage() {
  const [activeTab, setActiveTab] = useState('roles');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        return <GestionRoles />;
      
      case 'permisos':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sistema de Permisos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tarjetas de permisos */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-bold">Gestionar Club</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Acceso total a la configuración del club, equipos y categorías.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-bold">Gestionar Jugadores</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Añadir, editar y eliminar jugadores de cualquier equipo.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-bold">Gestionar Eventos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Crear y administrar partidos y entrenamientos para todos los equipos.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-bold">Ver Estadísticas</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Acceso a todos los análisis de rendimiento del club.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-bold">Gestionar Usuarios</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invitar usuarios y asignar roles (excepto Administrador).</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-bold">Acceso de Equipo</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Permisos limitados al equipo asignado (gestionar jugadores, eventos, etc.).</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Jerarquía de Roles</h2>
              <div className="space-y-4">
                {/* Nivel Administrador */}
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-r-lg">
                  <h4 className="font-bold text-purple-800 dark:text-purple-300">Administrador del Club</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Control total sobre el club, usuarios y configuraciones.</p>
                </div>
                {/* Nivel Entrenador */}
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300">Entrenador Principal</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona la plantilla, eventos y rendimiento de su equipo asignado.</p>
                </div>
                {/* Nivel Asistente */}
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                  <h4 className="font-bold text-green-800 dark:text-green-300">Entrenador Asistente</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Apoya al entrenador en la gestión de eventos y visualización de datos.</p>
                </div>
                {/* Nivel Jugador */}
                <div className="p-4 border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg">
                  <h4 className="font-bold text-gray-800 dark:text-gray-300">Jugador</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Accede a su perfil, estadísticas personales y eventos del equipo.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="w-2 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Gestión de Roles</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Administra los usuarios, roles y permisos de tu club.</p>
          </div>
        </div>
      </div>

      {/* Pestañas rediseñadas como botones encapsulados */}
      <div className="w-full">
        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-900 p-1.5 shadow-inner">
          <button onClick={() => setActiveTab('roles')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all duration-300 ${activeTab === 'roles' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-transparent text-gray-600 dark:text-gray-400'}`}>
            <FaUserShield />
            Roles y Usuarios
          </button>
          <button onClick={() => setActiveTab('permisos')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all duration-300 ${activeTab === 'permisos' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'bg-transparent text-gray-600 dark:text-gray-400'}`}>
            <FaLock />
            Jerarquía y Permisos
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default GestionRolesPage;
