// src/pages/GestionRolesPage.jsx - Página dedicada para gestión de roles

import { useState } from 'react';
import GestionRoles from '../components/GestionRoles';
import { FaLock, FaUserShield } from 'react-icons/fa';

function GestionRolesPage() {
  const [activeTab, setActiveTab] = useState('roles');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        return <GestionRoles />;

      case 'permisos':
        return (
          <div className="space-y-8">
            {/* Sistema de Permisos - estilo transparente */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-2xl shadow-xl border border-white/10">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-driblab-text mb-4">Sistema de Permisos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-black/25 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold text-driblab-text flex items-center gap-2">
                      <FaUserShield className="text-blue-300" /> Gestionar Club
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Acceso total a la configuración del club, equipos y categorías.
                    </p>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold text-driblab-text flex items-center gap-2">
                      <FaUserShield className="text-green-300" /> Gestionar Jugadores
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Añadir, editar y eliminar jugadores de cualquier equipo.
                    </p>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold text-driblab-text flex items-center gap-2">
                      <FaUserShield className="text-purple-300" /> Gestionar Eventos
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Crear y administrar partidos y entrenamientos para todos los equipos.
                    </p>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold text-driblab-text flex items-center gap-2">
                      <FaUserShield className="text-yellow-300" /> Ver Estadísticas
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Acceso a todos los análisis de rendimiento del club.
                    </p>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold text-driblab-text flex items-center gap-2">
                      <FaUserShield className="text-pink-300" /> Gestionar Usuarios
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Invitar usuarios y asignar roles (excepto Administrador).
                    </p>
                  </div>
                  <div className="bg-black/25 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
                    <h4 className="font-bold text-driblab-text flex items-center gap-2">
                      <FaUserShield className="text-cyan-300" /> Acceso de Equipo
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Permisos limitados al equipo asignado (gestionar jugadores, eventos, etc.).
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8" />
            </div>

            {/* Jerarquía de Roles - estilo transparente */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-2xl shadow-xl border border-white/10">
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl font-bold text-driblab-text mb-2">Jerarquía de Roles</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-black/25 backdrop-blur-xl rounded-2xl border border-white/20">
                    <h4 className="font-bold text-purple-200 flex items-center gap-2">
                      <FaLock className="text-purple-300" /> Administrador del Club
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Control total sobre el club, usuarios y configuraciones.
                    </p>
                  </div>
                  <div className="p-4 bg-black/25 backdrop-blur-xl rounded-2xl border border-white/20">
                    <h4 className="font-bold text-blue-200 flex items-center gap-2">
                      <FaUserShield className="text-blue-300" /> Entrenador Principal
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Gestiona la plantilla, eventos y rendimiento de su equipo asignado.
                    </p>
                  </div>
                  <div className="p-4 bg-black/25 backdrop-blur-xl rounded-2xl border border-white/20">
                    <h4 className="font-bold text-green-200 flex items-center gap-2">
                      <FaUserShield className="text-green-300" /> Entrenador Asistente
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Apoya al entrenador en la gestión de eventos y visualización de datos.
                    </p>
                  </div>
                  <div className="p-4 bg-black/25 backdrop-blur-xl rounded-2xl border border-white/20">
                    <h4 className="font-bold text-gray-200 flex items-center gap-2">
                      <FaUserShield className="text-gray-300" /> Jugador
                    </h4>
                    <p className="text-sm text-driblab-subtle mt-1">
                      Accede a su perfil, estadísticas personales y eventos del equipo.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-6 -mt-6" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full -ml-4 -mb-4" />
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
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administra los usuarios, roles y permisos de tu club.
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas rediseñadas como botones encapsulados */}
      <div className="w-full">
        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-900 p-1.5 shadow-inner border border-black/10">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all duration-300 ${
              activeTab === 'roles'
                ? 'bg-gradient-to-r from-orange-500/60 via-amber-400/60 to-sky-500/60 text-white shadow-md border border-black/10'
                : 'bg-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            <FaUserShield />
            Roles y Usuarios
          </button>
          <button
            onClick={() => setActiveTab('permisos')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all duration-300 ${
              activeTab === 'permisos'
                ? 'bg-gradient-to-r from-orange-500/60 via-amber-400/60 to-sky-500/60 text-white shadow-md border border-black/10'
                : 'bg-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            <FaLock />
            Jerarquía y Permisos
          </button>
        </div>
      </div>

      <div className="bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-lg border border-white/10">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default GestionRolesPage;
