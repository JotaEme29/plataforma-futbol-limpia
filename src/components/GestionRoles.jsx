// src/components/GestionRoles.jsx - GESTIÓN DE ROLES Y PERMISOS PARA PLATAFORMA FÚTBOL 2.0

import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { FaPlus } from 'react-icons/fa';

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

function GestionRoles() {
  const { currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    rol: 'entrenador',
    equipoId: '',
    nombre: '',
    apellido: ''
  });

  const roles = [
    { 
      value: 'administrador_club', 
      label: 'Administrador del Club',
      description: 'Acceso completo a todas las funcionalidades del club',
      permissions: ['gestionar_equipos', 'gestionar_jugadores', 'gestionar_eventos', 'ver_estadisticas', 'gestionar_usuarios']
    },
    { 
      value: 'entrenador', 
      label: 'Entrenador Principal',
      description: 'Gestión completa de su equipo asignado',
      permissions: ['gestionar_jugadores_equipo', 'gestionar_eventos_equipo', 'ver_estadisticas_equipo']
    },
    { 
      value: 'asistente', 
      label: 'Entrenador Asistente',
      description: 'Asistencia en la gestión del equipo',
      permissions: ['ver_jugadores_equipo', 'gestionar_eventos_equipo', 'ver_estadisticas_equipo']
    },
    { 
      value: 'jugador', 
      label: 'Jugador',
      description: 'Acceso a información personal y del equipo',
      permissions: ['ver_perfil_personal', 'ver_eventos_equipo', 'ver_estadisticas_personales']
    }
  ];

  useEffect(() => {
    if (currentUser?.clubId) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios del club
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('clubId', '==', currentUser.clubId));
      const usuariosSnapshot = await getDocs(q);
      const usuariosData = usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(usuariosData);

      // Cargar invitaciones pendientes
      const invitacionesRef = collection(db, 'invitaciones');
      const qInvitaciones = query(
        invitacionesRef, 
        where('clubId', '==', currentUser.clubId),
        where('estado', '==', 'pendiente')
      );
      const invitacionesSnapshot = await getDocs(qInvitaciones);
      const invitacionesData = invitacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvitaciones(invitacionesData);

      // Cargar equipos
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    
    try {
      const invitacionesRef = collection(db, 'invitaciones');
      const docRef = await addDoc(invitacionesRef, {
        ...inviteData,
        clubId: currentUser.clubId,
        clubNombre: currentUser.club?.nombre,
        invitadoPor: currentUser.uid,
        fechaInvitacion: serverTimestamp(),
        estado: 'pendiente'
      });

      // Generar link de invitación
      const inviteLink = `${window.location.origin}/aceptar-invitacion?id=${docRef.id}`;
      
      // Copiar al portapapeles
      await navigator.clipboard.writeText(inviteLink);
      
      alert(`✅ ¡Invitación creada exitosamente!\n\n📋 El link ha sido copiado al portapapeles.\n\n🔗 También lo encontrarás en la sección "Invitaciones Pendientes" más abajo.\n\n💡 Ahora solo tienes que enviárselo a ${inviteData.nombre} por WhatsApp, Email o cualquier otro medio.`);
      
      setInviteData({ email: '', rol: 'entrenador', equipoId: '', nombre: '', apellido: '' });
      setShowInviteForm(false);
      loadData();
    } catch (error) {
      console.error('Error al enviar invitación:', error);
      alert('❌ Error al crear la invitación. Intenta nuevamente.');
    }
  };

  const handleUpdateUserRole = async (userId, newRole, equipoId = null) => {
    if (window.confirm('¿Estás seguro de que quieres cambiar el rol de este usuario?')) {
      try {
        const userDocRef = doc(db, 'usuarios', userId);
        const updateData = { rol: newRole };
        
        if (equipoId) {
          updateData.equipoId = equipoId;
        }
        
        await updateDoc(userDocRef, updateData);
        loadData();
        alert('Rol actualizado exitosamente');
      } catch (error) {
        console.error('Error al actualizar rol:', error);
        alert('Error al actualizar el rol');
      }
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta invitación?')) {
      try {
        const invitationDocRef = doc(db, 'invitaciones', invitationId);
        await deleteDoc(invitationDocRef);
        loadData();
      } catch (error) {
        console.error('Error al cancelar invitación:', error);
      }
    }
  };

  const getRoleInfo = (roleValue) => {
    return roles.find(role => role.value === roleValue) || { label: roleValue, description: '', permissions: [] };
  };

  const getEquipoNombre = (equipoId) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.nombre : 'No asignado';
  };

  if (loading) {
    return <div className="text-center p-8">Cargando gestión de roles...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios e Invitaciones</h2>
        <button 
          onClick={() => setShowInviteForm(true)}
          className="flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-orange-500/70 via-amber-400/70 to-sky-500/70 hover:from-orange-500 hover:via-amber-400 hover:to-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
        >
          <FaPlus /> Invitar Usuario
        </button>
      </div>

      {/* Información de Roles */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Tipos de Roles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(role => (
            <div key={role.value} className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-black/10">
              <h4 className="font-bold text-gray-800 dark:text-gray-200">{role.label}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Usuarios Actuales */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Usuarios del Club ({usuarios.length})</h3>
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-md overflow-hidden border border-black/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-orange-500/20 via-amber-400/20 to-sky-500/20 dark:bg-gradient-to-r dark:from-orange-500/20 dark:via-amber-400/20 dark:to-sky-500/20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Equipo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {usuarios.map(usuario => {
                  const roleInfo = getRoleInfo(usuario.rol);
                  return (
                    <tr key={usuario.id} className="hover:bg-gradient-to-r hover:from-orange-500/10 hover:via-amber-400/10 hover:to-sky-500/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{usuario.nombre} {usuario.apellido}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {usuario.equipoId ? getEquipoNombre(usuario.equipoId) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {usuario.id !== currentUser.uid ? (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const [newRole, equipoId] = e.target.value.split('|');
                                handleUpdateUserRole(usuario.id, newRole, equipoId);
                                e.target.value = '';
                              }
                            }}
                        className="bg-white/80 dark:bg-gray-700/80 border border-black/10 dark:border-black/20 rounded-md py-1 px-2 text-sm"
                          >
                            <option value="">Cambiar rol...</option>
                            {roles.map(role => (
                              <optgroup key={role.value} label={role.label}>
                                {['entrenador', 'asistente', 'jugador'].includes(role.value) ? (
                                  equipos.map(equipo => (
                                    <option key={`${role.value}-${equipo.id}`} value={`${role.value}|${equipo.id}`}>
                                      {role.label} - {equipo.nombre}
                                    </option>
                                  ))
                                ) : (
                                  <option value={`${role.value}|`}>{role.label}</option>
                                )}
                              </optgroup>
                            ))}
                          </select>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-500/30 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100">Tú</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invitaciones Pendientes */}
      {invitaciones.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Invitaciones Pendientes ({invitaciones.length})</h3>
          <div className="grid grid-cols-1 gap-4">
            {invitaciones.map(invitacion => {
              const roleInfo = getRoleInfo(invitacion.rol);
              const inviteLink = `${window.location.origin}/aceptar-invitacion?id=${invitacion.id}`;
              
              return (
                <div key={invitacion.id} className="bg-gradient-to-r from-orange-500/10 via-amber-400/10 to-sky-500/10 dark:from-orange-500/10 dark:via-amber-400/10 dark:to-sky-500/10 p-6 rounded-xl border-2 border-amber-400/60 dark:border-amber-500/60 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Info del invitado */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">PENDIENTE</span>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{invitacion.nombre} {invitacion.apellido}</h4>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">📧 {invitacion.email}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">👤 <strong>Rol:</strong> {roleInfo.label}</p>
                      {invitacion.equipoId && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">⚽ <strong>Equipo:</strong> {getEquipoNombre(invitacion.equipoId)}</p>
                      )}
                    </div>

                    {/* Link de invitación */}
                    <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">🔗 LINK DE INVITACIÓN</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inviteLink}
                          readOnly
                          className="flex-1 text-xs px-3 py-2 bg-white/80 dark:bg-gray-700/80 border border-black/10 dark:border-black/20 rounded-md font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(inviteLink);
                            alert('✅ Link copiado al portapapeles!\n\nEnvíalo por WhatsApp o Email al invitado.');
                          }}
                          className="bg-gradient-to-r from-orange-500/70 via-amber-400/70 to-sky-500/70 hover:from-orange-500 hover:via-amber-400 hover:to-sky-500 text-white font-bold px-4 py-2 rounded-md transition-colors text-sm whitespace-nowrap"
                        >
                          📋 Copiar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        💡 Copia este link y envíaselo al invitado para que cree su cuenta
                      </p>
                    </div>

                    {/* Botón cancelar */}
                    <div>
                      <button 
                        onClick={() => handleCancelInvitation(invitacion.id)}
                        className="bg-red-500/80 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors whitespace-nowrap"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario de Invitación */}
      <Modal isOpen={showInviteForm} onRequestClose={() => setShowInviteForm(false)} style={customStyles} contentLabel="Formulario de Invitación">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Invitar Nuevo Usuario</h2>
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  value={inviteData.nombre}
                  onChange={(e) => setInviteData({...inviteData, nombre: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido *</label>
                <input
                  type="text"
                  id="apellido"
                  value={inviteData.apellido}
                  onChange={(e) => setInviteData({...inviteData, apellido: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
              <input
                type="email"
                id="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol *</label>
              <select
                id="rol"
                value={inviteData.rol}
                onChange={(e) => setInviteData({...inviteData, rol: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 py-2"
                required
              >
                {roles.filter(role => role.value !== 'administrador_club').map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            {(inviteData.rol === 'entrenador' || inviteData.rol === 'asistente' || inviteData.rol === 'jugador') && (
              <div>
                <label htmlFor="equipoId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asignar a Equipo *</label>
                <select
                  value={inviteData.equipoId}
                  id="equipoId"
                  onChange={(e) => setInviteData({...inviteData, equipoId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar equipo</option>
                  {equipos.map(equipo => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="pt-6 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button type="submit" className="bg-gradient-to-r from-orange-500/70 via-amber-400/70 to-sky-500/70 hover:from-orange-500 hover:via-amber-400 hover:to-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors">Enviar Invitación</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default GestionRoles;
