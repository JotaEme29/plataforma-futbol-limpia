export const ROLES = {
  ADMINISTRADOR: 'administrador',
  ENTRENADOR: 'entrenador',
  JUGADOR: 'jugador'
};

export const PERMISSIONS = {
  // Administrador - Acceso total
  [ROLES.ADMINISTRADOR]: [
    'gestionar_club',
    'gestionar_equipos',
    'gestionar_jugadores',
    'gestionar_eventos',
    'ver_estadisticas',
    'gestionar_roles'
  ],
  
  // Entrenador - Gestión de equipo asignado
  [ROLES.ENTRENADOR]: [
    'gestionar_jugadores',  // Solo de su equipo
    'gestionar_eventos',     // Solo de su equipo
    'ver_estadisticas'       // Solo de su equipo
  ],
  
  // Jugador - Solo visualización
  [ROLES.JUGADOR]: [
    'ver_estadisticas_propias',
    'ver_equipo_asignado'
  ]
};

export const hasPermission = (userRole, permission, context = {}) => {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};