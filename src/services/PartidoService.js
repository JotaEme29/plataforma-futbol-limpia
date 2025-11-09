// src/services/partidoService.js

import { db } from '../firebase';
import { 
  doc, 
  collection, 
  writeBatch, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, // ¡Importante para el feed en vivo!
  getDocs
} from 'firebase/firestore';

// --- FUNCIONES DE CONFIGURACIÓN INICIAL ---

/**
 * Establece la alineación titular y los suplentes para un partido.
 * Usa un 'writeBatch' para asegurar que ambas actualizaciones (titulares y suplentes)
 * se realicen de forma atómica. Esto es una única escritura desde la perspectiva de Firebase.
 * @param {string} eventoId - El ID del evento (partido).
 * @param {string[]} titularesIds - Array con los IDs de los jugadores titulares.
 * @param {string[]} suplentesIds - Array con los IDs de los jugadores suplentes.
 */
export const guardarAlineacion = async (eventoId, titularesIds, suplentesIds) => {
  const eventoDocRef = doc(db, 'eventos', eventoId);
  const batch = writeBatch(db);

  batch.update(eventoDocRef, {
    alineacion_titular: titularesIds,
    banquillo: suplentesIds,
    estado_partido: 'configurado' // Nuevo estado para saber que la alineación está lista
  });

  await batch.commit();
  console.log("Alineación guardada correctamente.");
};


// --- FUNCIONES DURANTE EL PARTIDO (EN VIVO) ---

/**
 * Registra una nueva acción (Gol, Falta, etc.) en la subcolección del partido.
 * Esta es una operación de escritura única y optimizada (addDoc).
 * @param {string} eventoId - El ID del evento.
 * @param {object} accionData - El objeto que describe la acción.
 *   Ej: { tipo: 'GOL', minuto: 75, jugador_principal_id: 'xyz' }
 */
export const registrarAccion = async (eventoId, accionData) => {
  const accionesRef = collection(db, 'eventos', eventoId, 'acciones_partido');
  await addDoc(accionesRef, {
    ...accionData,
    timestamp: serverTimestamp() // Firebase se encarga de poner la hora del servidor.
  });
};

/**
 * Crea un 'listener' en tiempo real para el feed de acciones del partido.
 * ESTA ES LA ÚNICA CONEXIÓN EN TIEMPO REAL que mantendremos abierta durante el partido.
 * Es eficiente porque solo escucha una subcolección específica.
 * @param {string} eventoId - El ID del evento.
 * @param {function} callback - La función que se ejecutará cada vez que haya nuevas acciones.
 *   Recibirá un array de acciones ordenadas.
 * @returns {function} - Una función 'unsubscribe' para cerrar la conexión al terminar.
 */
export const escucharAccionesEnVivo = (eventoId, callback) => {
  const accionesRef = collection(db, 'eventos', eventoId, 'acciones_partido');
  const q = query(accionesRef, orderBy('timestamp', 'asc'));

  // onSnapshot abre la conexión en tiempo real.
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const acciones = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(acciones); // Enviamos los datos actualizados al componente.
  });

  return unsubscribe; // Devolvemos la función para poder cerrar la conexión.
};

// ¡NUEVA FUNCIÓN!
export const eliminarAccion = async (eventoId, accionId) => {
  const accionRef = doc(db, 'eventos', eventoId, 'acciones_partido', accionId);
  await deleteDoc(accionRef);
};


// --- FUNCIONES POST-PARTIDO ---

/**
 * Procesa todas las acciones registradas para calcular las estadísticas finales.
 * Esta función realiza UNA ÚNICA LECTURA (getDocs) de todas las acciones al final.
 * Luego, usa un 'writeBatch' para actualizar todos los documentos de jugadores y el
 * evento principal en UNA SOLA OPERACIÓN ATÓMICA. Es la forma más eficiente.
 * @param {string} eventoId - El ID del evento.
 * @param {object} jugadoresConvocados - Un objeto { id: datos_jugador } para acceso rápido.
 */
export const finalizarPartidoYCalcularStats = async (eventoId, jugadoresConvocados) => {
  console.log("Iniciando cálculo de estadísticas finales...");
  const accionesRef = collection(db, 'eventos', eventoId, 'acciones_partido');
  const accionesSnapshot = await getDocs(accionesRef); // 1 lectura de la colección completa.
  const acciones = accionesSnapshot.docs.map(doc => doc.data());

  // Objeto para acumular estadísticas
  const statsFinales = {};
  for (const id in jugadoresConvocados) {
    statsFinales[id] = {
      goles: 0,
      asistencias: 0,
      tarjetas_amarillas: 0,
      tarjetas_rojas: 0,
      // ... otros contadores
    };
  }

  // Procesamos cada acción para acumular los datos
  acciones.forEach(accion => {
    const { tipo, jugador_principal_id, jugador_secundario_id } = accion;
    if (!jugador_principal_id) return;

    switch (tipo) {
      case 'GOL':
        statsFinales[jugador_principal_id].goles += 1;
        if (jugador_secundario_id) {
          statsFinales[jugador_secundario_id].asistencias += 1;
        }
        break;
      case 'AMARILLA':
        statsFinales[jugador_principal_id].tarjetas_amarillas += 1;
        break;
      // ... más casos para otros tipos de acciones
    }
  });
  
  // Ahora, preparamos la gran actualización en lote
  const batch = writeBatch(db);

  for (const jugadorId in statsFinales) {
    const jugadorDocRef = doc(db, 'jugadores', jugadorId);
    const stats = statsFinales[jugadorId];
    
    // Aquí iría la lógica compleja para actualizar los promedios del jugador,
    // similar a la que ya tenías, pero usando los 'stats' que acabamos de calcular.
    // Por ahora, solo actualizamos los totales.
    batch.update(jugadorDocRef, {
      total_goles: increment(stats.goles),
      total_asistencias: increment(stats.asistencias),
      // ... etc.
    });
  }

  // Finalmente, actualizamos el estado del evento principal
  const eventoDocRef = doc(db, 'eventos', eventoId);
  batch.update(eventoDocRef, {
    estado_partido: 'finalizado',
    // Aquí también podrías guardar el resultado final, etc.
  });

  await batch.commit(); // Ejecutamos todas las actualizaciones a la vez.
  console.log("¡Estadísticas finales calculadas y guardadas!");

  return statsFinales; // Devolvemos las stats por si la UI las necesita.
};

// NOTA: La función 'increment' debe ser importada de 'firebase/firestore'
// import { increment } from 'firebase/firestore';
