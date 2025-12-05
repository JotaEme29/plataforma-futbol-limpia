// src/pages/DetalleEvento.jsx - Refactorizado con Tailwind CSS

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  onSnapshot,
  increment,
  orderBy,
  query,
  where,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import CampoDeJuego from '../components/CampoDeJuego';
import Cronometro from '../components/Cronometro';
import EvaluacionRapida from '../components/EvaluacionRapida'; // Importamos el nuevo componente
import { ordenPosiciones } from '../../config/formaciones';
import {
  FaPlay,
  FaPause,
  FaStop,
  FaFlag,
  FaRedo,
  FaCheckCircle,
  FaFutbol,
  FaBullseye,
  FaFlagCheckered,
  FaHandHolding,
  FaSquareFull,
  FaExclamationTriangle
} from 'react-icons/fa';

const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return "0'";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}'`;
};

function DetalleEvento() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Estados principales
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('convocatoria');

  // Estados de datos
  const [convocados, setConvocados] = useState([]);
  const [noConvocados, setNoConvocados] = useState([]);
  const [titulares, setTitulares] = useState([]);
  const [suplentes, setSuplentes] = useState([]);
  const [formacion, setFormacion] = useState('4-3-3');
  const [jugadorParaIntercambio, setJugadorParaIntercambio] = useState(null);

  // Estados para "En Vivo"
  const [fase, setFase] = useState('preparacion');
  const [enPausa, setEnPausa] = useState(true);
  const [segundosReloj, setSegundosReloj] = useState(0);
  const [segundosAcumulados, setSegundosAcumulados] = useState(0);
  const [timestampInicio, setTimestampInicio] = useState(null);
  const [acciones, setAcciones] = useState([]);
  const [seleccionandoAccion, setSeleccionandoAccion] = useState(null);
  const [marcador, setMarcador] = useState({ local: 0, visitante: 0 });
  const [evaluaciones, setEvaluaciones] = useState({});
  const [tiempoEnCampo, setTiempoEnCampo] = useState({});
  const momentumStorageKey = `momentum_${eventoId}`;

  // Estado para la pestaña activa en la vista móvil de la torre de control "En Vivo"
  const [controlTab, setControlTab] = useState('acciones');

  // Estado para el panel móvil
  const [mobilePanel, setMobilePanel] = useState(null);

  // Estados para la sección de observaciones de entrenamiento
  const [observacionGuardada, setObservacionGuardada] = useState(false);
  const [loadingObservacion, setLoadingObservacion] = useState(false);
  const [errorObservacion, setErrorObservacion] = useState('');



  // --- Funciones auxiliares para determinar estado del evento ---
  const eventoYaPaso = useMemo(() => {
    if (!evento?.fecha) return false;
    const fechaEvento = evento.fecha?.toDate ? evento.fecha.toDate() : new Date(evento.fecha);
    const ahora = new Date();
    return fechaEvento < ahora;
  }, [evento]);

  const partidoIniciado = useMemo(() => {
    // Solo es true si el partido está en '1T', '2T', 'descanso', o 'finalizado'
    // Si no hay fase o es 'preparacion', devuelve false
    const iniciado = fase && fase !== 'preparacion' && fase !== '';
    return iniciado;
  }, [fase]);

  const partidoFinalizado = useMemo(() => {
    return fase === 'finalizado' || evento?.evaluado === true;
  }, [fase, evento]);

  const TabButton = ({ tabName, children, disabled = false }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      disabled={disabled}
      className={`px-3 md:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border whitespace-nowrap flex-none ${activeTab === tabName
          ? 'bg-gradient-to-r from-orange-500/40 via-amber-400/40 to-sky-500/40 text-white shadow border-black/20'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
        }`}
    >
      {children}
    </button>
  );


  // Carga de datos inicial
  const cargarDatos = useCallback(async () => {
    if (!currentUser?.clubId || !eventoId) {
      setError('No se ha podido determinar el club o el evento.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
      const eventoSnap = await getDoc(eventoRef);

      if (!eventoSnap.exists()) {
        setError('Evento no encontrado.');
        setLoading(false);
        return;
      }

      const eventoData = { id: eventoSnap.id, ...eventoSnap.data() };

      // Si el nombre del equipo no está en el evento, lo cargamos desde el documento del equipo.
      if (eventoData.equipoId && !eventoData.nombre_equipo) {
        try {
          const equipoRef = doc(db, 'clubes', currentUser.clubId, 'equipos', eventoData.equipoId);
          const equipoSnap = await getDoc(equipoRef);
          if (equipoSnap.exists() && equipoSnap.data()?.nombre) {
            // Asumimos que el campo del nombre del equipo es 'nombre'
            eventoData.nombre_equipo = equipoSnap.data().nombre;
          }
        } catch (e) {
          console.warn("No se pudo cargar el nombre del equipo:", e);
        }
      }

      setEvento(eventoData);

      // Determinar tab inicial según estado del evento
      if (eventoData.evaluado || eventoData.fase === 'finalizado') {
        setActiveTab('evaluacion'); // Si ya finalizó, mostrar solo evaluación
      } else if (eventoData.fase && eventoData.fase !== 'preparacion') {
        setActiveTab('envivo'); // Si está en curso, ir a En Vivo
      } else {
        setActiveTab('convocatoria'); // Si no ha iniciado, mostrar convocatoria
      }

      if (!eventoData.equipoId) {
        setError('El evento no tiene un equipo asignado.');
        setLoading(false);
        return;
      }

      const jugadoresRef = collection(db, 'clubes', currentUser.clubId, 'equipos', eventoData.equipoId, 'jugadores');
      const jugadoresSnapshot = await getDocs(jugadoresRef);
      const listaJugadores = jugadoresSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      const idsConv = Array.isArray(eventoData.convocados) ? eventoData.convocados : [];
      const convocadosData = listaJugadores.filter(j => idsConv.includes(j.id));
      const noConvocadosData = listaJugadores.filter(j => !idsConv.includes(j.id));
      setConvocados(convocadosData);
      setNoConvocados(noConvocadosData);

      const titIds = Array.isArray(eventoData.alineacion_titular) ? eventoData.alineacion_titular : [];
      const banqIds = Array.isArray(eventoData.banquillo) ? eventoData.banquillo : [];

      if (titIds.length > 0) {
        const orden = ordenPosiciones[eventoData.formacion || '4-3-3'] || ordenPosiciones['4-3-3'];
        const titularesConPosicion = convocadosData
          .filter(j => titIds.includes(j.id))
          .map((jugador, index) => ({ // CUIDADO: El index puede no ser fiable si el orden de titIds no es el de la formación
            ...jugador,
            posicionCampo: orden[index] || null // Asigna posición según el orden guardado
          }));
        setTitulares(titularesConPosicion);
        setSuplentes(convocadosData.filter(j => !titIds.includes(j.id)));
      } else {
        setSuplentes(convocadosData);
        setTitulares([]);
      }

      // Sincronizar fase desde Firebase
      if (eventoData.fase) {
        setFase(eventoData.fase);
      }

      // Cargar evaluaciones si el evento ya fue evaluado
      if (eventoData.evaluado) {
        const evaluacionesRef = collection(db, 'clubes', currentUser.clubId, 'eventos', eventoId, 'evaluaciones');
        const evaluacionesSnap = await getDocs(evaluacionesRef);
        const evaluacionesData = {};
        const tiempoEnCampoData = {};

        evaluacionesSnap.docs.forEach(doc => {
          const data = doc.data();
          evaluacionesData[doc.id] = data;
          // Reconstruir tiempoEnCampo desde los minutos guardados
          if (data.minutos_jugados) {
            tiempoEnCampoData[doc.id] = data.minutos_jugados * 60; // Convertir minutos a segundos
          }
        });

        setEvaluaciones(evaluacionesData);
        setTiempoEnCampo(tiempoEnCampoData);
      }

    } catch (e) {
      console.error('Error cargando datos del evento:', e);
      setError('No se pudo cargar la información del evento.');
    } finally {
      setLoading(false);
    }
  }, [eventoId, currentUser]);

  useEffect(() => { // Este useEffect llama a la función de carga.
    cargarDatos();
  }, [cargarDatos]);

  // Restaurar momentum desde sessionStorage
  useEffect(() => {
    if (!eventoId) return;
    const stored = sessionStorage.getItem(momentumStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEvaluaciones(prev => {
          const merged = { ...prev };
          Object.entries(parsed || {}).forEach(([jugadorId, momentum]) => {
            merged[jugadorId] = { ...(merged[jugadorId] || {}), momentum };
          });
          return merged;
        });
      } catch (_) {
        // ignore parse errors
      }
    }
  }, [eventoId]);

  // Guardar momentum en sessionStorage para que no se pierda al cambiar de pestaña/recargar
  useEffect(() => {
    if (!eventoId) return;
    const toSave = {};
    Object.entries(evaluaciones).forEach(([jugadorId, evalData]) => {
      if (evalData && typeof evalData.momentum === 'number') {
        toSave[jugadorId] = evalData.momentum;
      }
    });
    sessionStorage.setItem(momentumStorageKey, JSON.stringify(toSave));
  }, [evaluaciones, eventoId]);

  // Sincroniza suplentes con convocados y titulares
  useEffect(() => {
    const idsTitulares = new Set(titulares.map(t => t.id));
    setSuplentes(convocados.filter(j => !idsTitulares.has(j.id)));
  }, [convocados, titulares]);

  // --- Listener para Acciones en Tiempo Real ---
  useEffect(() => {
    if (!currentUser?.clubId || !eventoId) return;

    const accionesRef = collection(db, 'clubes', currentUser.clubId, 'eventos', eventoId, 'acciones');
    const q = query(accionesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAcciones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe(); // Se desuscribe al desmontar el componente
  }, [eventoId, currentUser]);

  // --- Efecto para actualizar el marcador en tiempo real ---
  useEffect(() => {
    const golesLocal = acciones.filter(a =>
      (a.tipo === 'GOL' && evento?.condicion === 'Local') ||
      (a.tipo === 'GOL_EN_CONTRA' && evento?.condicion === 'Visitante')
    ).length;

    const golesVisitante = acciones.filter(a =>
      (a.tipo === 'GOL' && evento?.condicion === 'Visitante') ||
      (a.tipo === 'GOL_EN_CONTRA' && evento?.condicion === 'Local')
    ).length;

    setMarcador({ local: golesLocal, visitante: golesVisitante });
  }, [acciones, evento]);

  // --- Hook para persistir el estado del cronómetro en sessionStorage ---
  useEffect(() => {
    const timerStateKey = `timerState_${eventoId}`;
    const storedState = sessionStorage.getItem(timerStateKey);
    if (storedState) {
      const {
        fase: storedFase,
        segundosAcumulados: storedSegundosAcumulados,
        segundosReloj: storedSegundosReloj,
        tiempoEnCampo: storedTiempo,
        enPausa: storedEnPausa
      } = JSON.parse(storedState);

      setFase(storedFase || 'preparacion');
      setSegundosAcumulados(storedSegundosAcumulados || 0);
      setSegundosReloj(storedSegundosReloj || 0);
      setTiempoEnCampo(storedTiempo || {});
      setEnPausa(storedEnPausa ?? true);
    }

    const handleBeforeUnload = () => {
      sessionStorage.setItem(timerStateKey, JSON.stringify({
        fase,
        segundosAcumulados,
        segundosReloj,
        tiempoEnCampo,
        enPausa: true, // Siempre guardar como pausado
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]); // Solo se ejecuta una vez al montar el componente


  // --- Hook para el contador de minutos por jugador ---
  // MEJORADO: Prevenir que la pantalla se apague con Wake Lock API
  const wakeLockRef = useRef(null);
  const lastTickRef = useRef(null);

  useEffect(() => {
    if (enPausa || fase === 'preparacion' || fase === 'finalizado') {
      // Liberar Wake Lock cuando esté pausado
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      return;
    }

    // Solicitar Wake Lock para evitar que la pantalla se apague
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('⚠️Å Wake Lock no disponible:', err);
      }
    };
    requestWakeLock();

    lastTickRef.current = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, Math.floor((now - lastTickRef.current) / 1000));
      if (delta > 0) {
        lastTickRef.current = now;
        setSegundosReloj(prev => prev + delta);
        setTiempoEnCampo(prev => {
          const nuevoTiempo = { ...prev };
          titulares.forEach(jugador => {
            nuevoTiempo[jugador.id] = (nuevoTiempo[jugador.id] || 0) + delta;
          });
          return nuevoTiempo;
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      // Liberar Wake Lock al limpiar
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [enPausa, fase, titulares, timestampInicio, segundosAcumulados]);

  // --- Funciones de utilidad ---
  const formatearFecha = (f) => {
    if (!f) return 'Fecha no disponible';
    const d = f?.toDate ? f.toDate() : new Date(f);
    return d.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });
  };

  // --- Funciones de gestión ---
  const moverJugadorConvocatoria = (jugador, aConvocados) => {
    if (evento?.evaluado || partidoFinalizado) {
      alert("❌ No se puede modificar la convocatoria de un evento finalizado.");
      return;
    }
    if (partidoIniciado) {
      alert("❌ No se puede modificar la convocatoria después de iniciar el partido.");
      return;
    }
    if (aConvocados) {
      setNoConvocados(prev => prev.filter(j => j.id !== jugador.id));
      setConvocados(prev => [...prev, jugador]);
    } else {
      setConvocados(prev => prev.filter(j => j.id !== jugador.id));
      setNoConvocados(prev => [...prev, jugador]);
    }
  };

  const guardarConvocatoria = async () => {
    if (partidoFinalizado) {
      alert("❌ El partido ya ha finalizado. No se puede modificar la convocatoria.");
      return;
    }
    if (partidoIniciado) {
      alert("❌ No se puede guardar la convocatoria después de iniciar el partido.");
      return;
    }
    const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
    try {
      await updateDoc(eventoRef, {
        convocados: convocados.map(j => j.id)
      });
      alert("Convocatoria guardada con éxito.");

      // Actualiza el estado local para la pestaña de alineación
      setSuplentes(convocados);
      setTitulares([]); // Limpia los titulares para una nueva configuración
      setJugadorParaIntercambio(null); // Limpia la selección
      setActiveTab('alineacion'); // Opcional: Mueve al usuario a la siguiente pestaña

    } catch (err) {
      console.error("Error al guardar convocatoria:", err);
      setError("No se pudo guardar la convocatoria.");
    }
  };

  const agregarTitular = (jugador) => {
    const ordenFormacion = ordenPosiciones[formacion] || ordenPosiciones['4-3-3'];
    const maxTitulares = ordenFormacion.length;
    if (titulares.length >= maxTitulares) {
      alert(`Máximo ${maxTitulares} titulares para la formación ${formacion}. Reemplaza a un jugador existente.`);
      return;
    }

    const posicionesOcupadas = new Set(titulares.map(t => t.posicionCampo));
    const posLibre = ordenFormacion.find(p => !posicionesOcupadas.has(p));

    if (!posLibre) {
      alert('No hay posiciones libres en la formación actual.');
      return;
    }

    const jugadorConPosicion = { ...jugador, posicionCampo: posLibre };
    setTitulares(prev =>
      [...prev, jugadorConPosicion].sort((a, b) => ordenFormacion.indexOf(a.posicionCampo) - ordenFormacion.indexOf(b.posicionCampo))
    );
    // setSuplentes(prev => prev.filter(s => s.id !== jugador.id)); // Esto ya lo gestiona el useEffect de sincronización
  };

  const quitarTitular = (jugador) => {
    // Si hay un jugador del banquillo seleccionado para intercambio, realizamos la sustitución
    if (jugadorParaIntercambio) {
      // Solo permitimos sustitución si el seleccionado es un suplente
      if (!jugadorParaIntercambio.posicionCampo) {
        const posTitular = jugador.posicionCampo;
        const nuevoTitular = { ...jugadorParaIntercambio, posicionCampo: posTitular };
        const exTitular = { ...jugador };
        delete exTitular.posicionCampo;

        const orden = ordenPosiciones[formacion] || [];
        setTitulares(prev =>
          prev.map(t => t.id === jugador.id ? nuevoTitular : t)
            .sort((a, b) => orden.indexOf(a.posicionCampo) - orden.indexOf(b.posicionCampo))
        );
        // setSuplentes(prev => [...prev.filter(s => s.id !== jugadorParaIntercambio.id), exTitular]); // Gestionado por useEffect
        setJugadorParaIntercambio(null);
      } else {
        // Si el seleccionado es otro titular, hacemos un intercambio de posiciones
        const pos1 = jugador.posicionCampo;
        const pos2 = jugadorParaIntercambio.posicionCampo;
        const orden = ordenPosiciones[formacion] || [];
        setTitulares(prev => prev.map(t => {
          if (t.id === jugador.id) return { ...t, posicionCampo: pos2 };
          if (t.id === jugadorParaIntercambio.id) return { ...t, posicionCampo: pos1 };
          return t;
        }).sort((a, b) => orden.indexOf(a.posicionCampo) - orden.indexOf(b.posicionCampo)));
        setJugadorParaIntercambio(null); // Limpiamos la selección
      }
    } else {
      // Si no hay jugador para intercambio, la acción es seleccionar al titular
      // o moverlo al banquillo si se hace desde la pestaña de alineación.
      if (activeTab === 'alineacion') {
        const jugadorSinPosicion = { ...jugador };
        delete jugadorSinPosicion.posicionCampo;
        setTitulares(prev => prev.filter(t => t.id !== jugador.id));
        // setSuplentes(prev => [...prev, jugadorSinPosicion]); // Gestionado por useEffect
      } else {
        // En modo "En Vivo", un clic en un titular lo selecciona para un posible intercambio
        seleccionarParaIntercambio(jugador);
      }
    }
  };

  const guardarAlineacion = async () => {

    if (partidoFinalizado) {
      alert("❌ El partido ya ha finalizado. No se puede modificar la alineación.");
      return;
    }
    if (partidoIniciado) {
      alert("❌ No se puede guardar la alineación después de iniciar el partido.");
      return;
    }
    const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
    try {
      await updateDoc(eventoRef, {
        alineacion_titular: titulares.map(j => j.id),
        banquillo: suplentes.map(j => j.id),
      });
      alert("Alineación guardada con éxito.");
    } catch (err) {
      console.error("Error al guardar alineación:", err);
      setError("No se pudo guardar la alineación.");
    }
  };

  // --- Lógica para "En Vivo" ---
  const minutoActual = Math.floor((segundosAcumulados + segundosReloj) / 60);

  const cambiarFase = async (nuevaFase) => {
    setFase(nuevaFase);
    // Persistir la fase en Firebase
    try {
      const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
      await updateDoc(eventoRef, { fase: nuevaFase });
    } catch (err) {
      console.error("Error al actualizar fase en Firebase:", err);
    }
    if (nuevaFase === 'descanso' || nuevaFase === 'finalizado') {
      // Al pausar, suma el tiempo transcurrido y reinicia el timestamp
      if (timestampInicio) {
        const ahora = Date.now();
        const segundosTranscurridos = Math.floor((ahora - timestampInicio) / 1000);
        setSegundosAcumulados(prev => prev + segundosTranscurridos);
        setSegundosReloj(0);
        setTimestampInicio(null);
      }
      setEnPausa(true);
      if (nuevaFase === 'finalizado') sincronizarStatsParaEvaluacion();
    }
    if (nuevaFase === 'primer_tiempo' || nuevaFase === 'segundo_tiempo') {
      setEnPausa(false);
      setTimestampInicio(Date.now());
    }
  };

  const registrarAccion = async (jugador, tipoAccionOverride = null) => {
    const tipoDeAccion = tipoAccionOverride || seleccionandoAccion?.tipo;
    if (!tipoDeAccion) return; // Si no hay acción, no hacemos nada

    try {
      const accionesRef = collection(db, 'clubes', currentUser.clubId, 'eventos', eventoId, 'acciones');
      await addDoc(accionesRef, {
        tipo: tipoDeAccion,
        minuto: minutoActual,
        jugador_id: jugador.id, // Usar jugador_id para consistencia
        jugador_nombre: `${jugador.nombre} ${jugador.apellidos}`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Error al registrar acción:", err);
      setError("No se pudo registrar la acción.");
    } finally {
      setSeleccionandoAccion(null); // Cierra el modo selección
    }
  };

  const registrarGolEnContra = async () => {
    if (window.confirm("¿Confirmas que el equipo rival ha marcado un gol?")) {
      // Llamamos a registrarAccion con un objeto jugador "ficticio"
      // y el tipo de acción GOL_EN_CONTRA.
      // El `seleccionandoAccion` se ignora gracias a `tipoAccionOverride`.
      const rival = { id: 'rival', nombre: 'Equipo', apellidos: 'Rival' };
      // Para que funcione, debemos simular que hay una acción seleccionada.
      setSeleccionandoAccion({ tipo: 'GOL_EN_CONTRA' }); // Simula la selección
      await registrarAccion(rival, 'GOL_EN_CONTRA');
    }
  };


  // Sobrescribimos la función onJugadorClick del campo para que registre acciones
  const handleJugadorClickEnVivo = (jugador) => {
    if (seleccionandoAccion) {
      // Si estamos registrando una acción (gol, tarjeta, etc.), se la asignamos al jugador.
      registrarAccion(jugador);
    } else {
      // Si no hay una acción seleccionada, el clic sirve para intercambiar jugadores.
      // Usamos la misma lógica que en la pestaña de alineación.
      quitarTitular(jugador);
    }
  };

  const sincronizarStatsParaEvaluacion = () => {
    const statsPorJugador = {};
    convocados.forEach(jugador => {
      statsPorJugador[jugador.id] = {
        goles: 0,
        asistencias: 0,
        minutos_jugados: 0,
        momentum: 0, // Inicializamos el momentum
        ...(evaluaciones[jugador.id] || {}),
      };
    });

    acciones.forEach(accion => {
      if (accion.tipo === 'GOL' && statsPorJugador[accion.jugador_id]) {
        statsPorJugador[accion.jugador_id].goles += 1;
      }
      if (accion.tipo === 'ASISTENCIA' && statsPorJugador[accion.jugador_id]) {
        statsPorJugador[accion.jugador_id].asistencias += 1;
      }
    });

    Object.keys(tiempoEnCampo).forEach(jugadorId => {
      if (statsPorJugador[jugadorId]) {
        statsPorJugador[jugadorId].minutos_jugados = Math.round(tiempoEnCampo[jugadorId] / 60);
      }
    });

    setEvaluaciones(statsPorJugador);
    setActiveTab('evaluacion');
    if (fase !== 'finalizado') setActiveTab('evaluacion'); // Solo cambia de pestaña si se hace clic manualmente
  };

  const handleMomentumChange = (jugadorId, cambio) => {
    setEvaluaciones(prev => ({
      ...prev,
      [jugadorId]: {
        ...prev[jugadorId],
        momentum: (prev[jugadorId]?.momentum || 0) + cambio,
      }
    }));
  };

  const guardarEvaluaciones = async () => {
    // Preparar stats si no existen
    let evaluacionesParaGuardar = evaluaciones;

    if (Object.keys(evaluacionesParaGuardar).length === 0) {
      // Generar evaluaciones automáticamente
      const statsPorJugador = {};
      convocados.forEach(jugador => {
        statsPorJugador[jugador.id] = {
          goles: 0,
          asistencias: 0,
          minutos_jugados: 0,
          momentum: 0,
        };
      });

      acciones.forEach(accion => {
        if (accion.tipo === 'GOL' && statsPorJugador[accion.jugador_id]) {
          statsPorJugador[accion.jugador_id].goles += 1;
        }
        if (accion.tipo === 'ASISTENCIA' && statsPorJugador[accion.jugador_id]) {
          statsPorJugador[accion.jugador_id].asistencias += 1;
        }
      });

      Object.keys(tiempoEnCampo).forEach(jugadorId => {
        if (statsPorJugador[jugadorId]) {
          statsPorJugador[jugadorId].minutos_jugados = Math.round(tiempoEnCampo[jugadorId] / 60);
        }
      });

      evaluacionesParaGuardar = statsPorJugador;
    } else {
      // Si ya existen evaluaciones, asegurarse de que tienen goles, asistencias y minutos actualizados
      const statsActualizados = { ...evaluacionesParaGuardar };

      // Recalcular goles y asistencias desde acciones
      Object.keys(statsActualizados).forEach(jugadorId => {
        statsActualizados[jugadorId] = {
          ...statsActualizados[jugadorId],
          goles: 0,
          asistencias: 0,
        };
      });

      acciones.forEach(accion => {
        if (accion.tipo === 'GOL' && statsActualizados[accion.jugador_id]) {
          statsActualizados[accion.jugador_id].goles += 1;
        }
        if (accion.tipo === 'ASISTENCIA' && statsActualizados[accion.jugador_id]) {
          statsActualizados[accion.jugador_id].asistencias += 1;
        }
      });

      // Actualizar minutos desde tiempoEnCampo
      Object.keys(tiempoEnCampo).forEach(jugadorId => {
        if (statsActualizados[jugadorId]) {
          statsActualizados[jugadorId].minutos_jugados = Math.round(tiempoEnCampo[jugadorId] / 60);
        }
      });

      evaluacionesParaGuardar = statsActualizados;
    }

    if (!window.confirm("¿Estás seguro de guardar las evaluaciones? Esta acción marcará el partido como finalizado y no se podrá modificar.")) {
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);

      let sumaPuntuaciones = 0;
      let numEvaluados = 0;

      for (const jugadorId in evaluacionesParaGuardar) {
        const evaluacionJugador = evaluacionesParaGuardar[jugadorId];
        const puntuacionBase = 6;
        let puntuacionFinal = puntuacionBase + (evaluacionJugador.momentum || 0);
        puntuacionFinal = Math.max(1, Math.min(10, puntuacionFinal)); // Clamp entre 1 y 10
        sumaPuntuaciones += puntuacionFinal;
        numEvaluados++;

        // --- CORRECCIÓN ---
        // Guardamos la evaluación dentro de una subcolección del evento actual.
        // Esto respeta la estructura de datos y las reglas de seguridad.
        const evalDocRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId, 'evaluaciones', jugadorId);
        batch.set(evalDocRef, { // Usamos set con el ID del jugador para evitar duplicados si se guarda varias veces.
          jugadorId: jugadorId,
          eventoId: eventoId,
          clubId: currentUser.clubId,
          equipoId: evento.equipoId,
          fecha_evento: evento.fecha,
          puntuacion: puntuacionFinal,
          goles: evaluacionJugador.goles || 0,
          asistencias: evaluacionJugador.asistencias || 0,
          minutos_jugados: evaluacionJugador.minutos_jugados || 0,
          momentum: evaluacionJugador.momentum || 0,
        });

        const jugadorDocRef = doc(db, 'clubes', currentUser.clubId, 'equipos', evento.equipoId, 'jugadores', jugadorId);
        batch.update(jugadorDocRef, {
          total_goles: increment(evaluacionJugador.goles || 0),
          total_asistencias: increment(evaluacionJugador.asistencias || 0),
          minutos_jugados: increment(evaluacionJugador.minutos_jugados || 0),
          // --- ¡NUEVO! ---
          // Calculamos y actualizamos la valoración media del jugador.
          partidos_jugados: increment(1),
          suma_valoraciones: increment(puntuacionFinal),
          // La valoración media se puede calcular en el frontend: suma_valoraciones / partidos_jugados
        });
      }

      const valoracionColectiva = numEvaluados > 0 ? (sumaPuntuaciones / numEvaluados) : 0;

      const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
      batch.update(eventoRef, {
        evaluado: true,
        marcador_local: marcador.local,
        marcador_visitante: marcador.visitante,
        valoracion_colectiva: valoracionColectiva, // ¡Guardamos la nueva valoración!
      });

      await batch.commit();
      alert("¡Evaluaciones y estadásticas guardadas con éxito!");
      cargarDatos();
      cargarDatos(); // ¡RECARGA DE DATOS!
    } catch (err) {
      console.error("Error al guardar evaluaciones:", err);
      setError("No se pudieron guardar las evaluaciones.");
    } finally {
      setLoading(false);
    }
  };

  const renderEvaluacion = () => (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Evaluación del Partido</h3>
      {evento.evaluado ? (
        <div className="space-y-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-bold text-green-700 dark:text-green-300">✅ Partido Finalizado</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Las evaluaciones han sido guardadas y las estadásticas actualizadas.</p>
          </div>

          {/* Resumen del Marcador */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Resultado Final</h4>
            <div className="flex justify-center items-center gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">{evento.condicion === 'Local' ? evento.nombre_equipo : evento.rival}</p>
                <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{marcador.local}</p>
              </div>
              <div className="text-3xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">{evento.condicion === 'Visitante' ? evento.nombre_equipo : evento.rival}</p>
                <p className="text-5xl font-black text-red-600 dark:text-red-400">{marcador.visitante}</p>
              </div>
            </div>
          </div>

          {/* Tabla de Estadásticas Finales */}
          <div className="border border-black/10 dark:border-black/20 rounded-lg overflow-hidden bg-white/70 dark:bg-gray-800/70">
            <div className="bg-gradient-to-r from-orange-500/20 via-amber-400/20 to-sky-500/20 px-4 py-3 border-b border-black/10">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Rendimiento de Jugadores</h4>
            </div>
            <div className="grid grid-cols-7 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase bg-white/60 dark:bg-gray-700/60 border-b border-black/10">
              <div className="col-span-2 p-2">Jugador</div>
              <div className="p-2 text-center">Nota</div>
              <div className="p-2 text-center">⚽ Goles</div>
              <div className="p-2 text-center">🤝 Asist.</div>
              <div className="p-2 text-center">⏱️ Mins</div>
              <div className="p-2 text-center">Momentum</div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {convocados.map(jugador => {
                const evaluacionJugador = evaluaciones[jugador.id] || {};
                const momentum = evaluacionJugador.momentum || 0;
                const puntuacionBase = 6;
                let puntuacionFinal = puntuacionBase + momentum;
                puntuacionFinal = Math.max(1, Math.min(10, puntuacionFinal));

                return (
                  <div key={jugador.id} className="grid grid-cols-7 items-center border-b border-black/5 dark:border-black/20 text-sm hover:bg-gradient-to-r hover:from-orange-500/10 hover:via-amber-400/10 hover:to-sky-500/10 dark:hover:from-orange-500/10 dark:hover:via-amber-400/10 dark:hover:to-sky-500/10 transition-colors">
                    <div className="col-span-2 p-2 font-medium">
                      <span className="font-bold text-gray-500 w-8 inline-block">{jugador.numero_camiseta}</span>
                      {jugador.apodo || jugador.nombre}
                    </div>
                    <div className={`p-2 text-center font-black text-lg ${puntuacionFinal >= 7 ? 'text-green-600' : puntuacionFinal >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {puntuacionFinal.toFixed(1)}
                    </div>
                    <div className="p-2 text-center font-semibold">{evaluacionJugador.goles || 0}</div>
                    <div className="p-2 text-center font-semibold">{evaluacionJugador.asistencias || 0}</div>
                    <div className="p-2 text-center">{evaluacionJugador.minutos_jugados || 0}'</div>
                    <div className={`p-2 text-center font-bold ${momentum > 0 ? 'text-green-600' : momentum < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {momentum > 0 ? `+${momentum}` : momentum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">Confirmar y Guardar Evaluaciones</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Las evaluaciones de "momentum" se han realizado en la pestaña "En Vivo".
              Aquá puedes revisar los datos sincronizados (goles, asistencias, minutos) y, cuando estés listo,
              guardar todas las evaluaciones para finalizar el partido.
            </p>

            {/* --- INICIO: Tabla de Resumen de Evaluaciones --- */}
            <div className="border border-black/10 dark:border-black/20 rounded-lg overflow-hidden bg-white/70 dark:bg-gray-800/70">
              <div className="grid grid-cols-6 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase bg-gradient-to-r from-orange-500/20 via-amber-400/20 to-sky-500/20">
                <div className="col-span-2 p-2">Jugador</div>
                <div className="p-2 text-center">Momentum</div>
                <div className="p-2 text-center">Nota Final</div>
                <div className="p-2 text-center">Goles</div>
                <div className="p-2 text-center">Mins</div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {convocados.map(jugador => {
                  const evaluacionJugador = evaluaciones[jugador.id] || {};
                  const momentum = evaluacionJugador.momentum || 0;
                  const puntuacionBase = 6;
                  let puntuacionFinal = puntuacionBase + momentum;
                  puntuacionFinal = Math.max(1, Math.min(10, puntuacionFinal));

                  return (
                    <div key={jugador.id} className="grid grid-cols-6 items-center border-t border-black/5 dark:border-black/20 text-sm hover:bg-gradient-to-r hover:from-orange-500/10 hover:via-amber-400/10 hover:to-sky-500/10 dark:hover:from-orange-500/10 dark:hover:via-amber-400/10 dark:hover:to-sky-500/10 transition-colors">
                      <div className="col-span-2 p-2 font-medium">
                        <span className="font-bold text-gray-500 w-8 inline-block">{jugador.numero_camiseta}</span>
                        {jugador.apodo || jugador.nombre}
                      </div>
                      <div className={`p-2 text-center font-bold ${momentum > 0 ? 'text-green-600' : momentum < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {momentum > 0 ? `+${momentum}` : momentum}
                      </div>
                      <div className="p-2 text-center font-black text-lg text-blue-600 dark:text-blue-400">{puntuacionFinal}</div>
                      <div className="p-2 text-center">{evaluacionJugador.goles || 0}</div>
                      <div className="p-2 text-center">{evaluacionJugador.minutos_jugados || 0}'</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* --- FIN: Tabla de Resumen de Evaluaciones --- */}
          </div>
          <button onClick={guardarEvaluaciones} className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition-colors font-semibold">
            Guardar Todas las Evaluaciones y Finalizar
          </button>
        </div>
      )}
    </div>
  );

  const renderConvocatoria = () => (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Gestión de Convocatoria</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna de No Convocados */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">Disponibles ({noConvocados.length})</h4>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {noConvocados.map(j => (
              <li key={j.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="text-sm"><span className="font-bold w-6 inline-block">{j.numero_camiseta}</span> {j.nombre} {j.apellidos}</span>
                <button onClick={() => moverJugadorConvocatoria(j, true)} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">Añadir</button>
              </li>
            ))}
          </ul>
        </div>
        {/* Columna de Convocados */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">Convocados ({convocados.length})</h4>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {convocados.map(j => (
              <li key={j.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="text-sm"><span className="font-bold w-6 inline-block">{j.numero_camiseta}</span> {j.nombre} {j.apellidos}</span>
                <button onClick={() => moverJugadorConvocatoria(j, false)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Quitar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6">
        <button onClick={guardarConvocatoria} className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-semibold">
          Guardar Convocatoria
        </button>
      </div>
    </div>
  );

  const renderAlineacion = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Define tu Alineación Titular</h3>
        <div>
          <label htmlFor="formacion" className="text-sm font-medium mr-2">Formación:</label>
          <select
            id="formacion"
            value={formacion}
            onChange={e => setFormacion(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2"
          >
            {Object.keys(ordenPosiciones).map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 flex justify-center items-center">
          <div className="w-full max-w-lg mx-auto">
            <CampoDeJuego
              titulares={titulares}
              formacion={formacion}
              onJugadorClick={quitarTitular}
              jugadorSeleccionadoId={jugadorParaIntercambio?.id}
            />
          </div>
        </div>
        <div className="xl:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">Banquillo ({suplentes.length})</h4>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {suplentes.map(j => (
              <li key={j.id} className={`flex justify-between items-center p-2 rounded-md transition-colors cursor-pointer ${jugadorParaIntercambio?.id === j.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <span className="text-sm"><span className="font-bold w-6 inline-block">{j.numero_camiseta}</span> {j.nombre}</span>
                <div>
                  {activeTab === 'alineacion' ? (
                    <button onClick={() => agregarTitular(j)} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">Alinear</button>
                  ) : (
                    <button onClick={() => seleccionarParaIntercambio(j)} className="text-yellow-500 hover:text-yellow-600 text-sm font-semibold">
                      {jugadorParaIntercambio?.id === j.id ? 'Cancelar' : 'Sustituir'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6">
        <button onClick={guardarAlineacion} className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-semibold">Guardar Alineación</button>
      </div>
    </div>
  );

<<<<<<< HEAD
  const seleccionarParaIntercambio = (jugador) => {
    // Si se vuelve a hacer clic en el mismo jugador, se deselecciona
    setJugadorParaIntercambio(prev => (prev?.id === jugador.id ? null : jugador));
  };

  const MarcadorCronoPanel = ({ isMobileHeader }) => (
    <div className={`bg-gradient-to-br from-gray-800 via-blue-900 to-gray-700 text-white px-2 py-1 rounded-md shadow border border-black/10 ${isMobileHeader ? 'sticky top-0 z-30' : ''}`}
      style={{ minHeight: isMobileHeader ? 48 : 60, maxHeight: isMobileHeader ? 60 : 80 }}>
      <div className="flex flex-row justify-between items-center gap-1">
        <div className="flex-1 text-center font-semibold text-xs truncate">
          {evento.condicion === 'Local' ? evento.nombre_equipo : evento.equipoRival}
        </div>
        <div className="flex-1 text-center">
          <span className="text-xl font-extrabold tracking-wide">{marcador.local} <span className="mx-1">-</span> {marcador.visitante}</span>
        </div>
        <div className="flex-1 text-center font-semibold text-xs truncate">
          {evento.condicion === 'Visitante' ? evento.nombre_equipo : evento.equipoRival}
        </div>
      </div>
      <div className="mt-1 flex flex-col items-center gap-1">
        <Cronometro
          segundos={segundosReloj}
          fase={fase}
        />
        {/* Botones de control de partido */}
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {fase === 'preparacion' && (
            <button className="btn-control-vivo" onClick={() => cambiarFase('primer_tiempo')}>Iniciar Partido</button>
          )}
          {fase === 'primer_tiempo' && (
            <>
              <button className="btn-control-vivo" onClick={() => setEnPausa(!enPausa)}>{enPausa ? 'Reanudar' : 'Pausar'}</button>
              <button className="btn-control-vivo" onClick={() => cambiarFase('descanso')}>Terminar 1er Tiempo</button>
            </>
          )}
          {fase === 'descanso' && (
            <button className="btn-control-vivo" onClick={() => cambiarFase('segundo_tiempo')}>Iniciar 2do Tiempo</button>
          )}
          {fase === 'segundo_tiempo' && (
            <>
              <button className="btn-control-vivo" onClick={() => setEnPausa(!enPausa)}>{enPausa ? 'Reanudar' : 'Pausar'}</button>
              <button className="btn-control-vivo" onClick={() => cambiarFase('finalizado')}>Finalizar Partido</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const AccionesPanel = () => (
    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
      <h4 className="font-bold mb-2 text-xs">Acciones Rápidas</h4>
      <div className="grid grid-cols-3 gap-1">
        <button onClick={() => setSeleccionandoAccion({ tipo: 'GOL' })} className="btn-accion-mini" title="Gol">
          <span role="img" aria-label="Gol">⚽</span>
        </button>
        <button onClick={() => setSeleccionandoAccion({ tipo: 'ASISTENCIA' })} className="btn-accion-mini" title="Asistencia">
          <span role="img" aria-label="Asistencia">🅰️</span>
        </button>
        <button onClick={() => setSeleccionandoAccion({ tipo: 'TIRO_A_PUERTA' })} className="btn-accion-mini" title="Tiro a Puerta">
          <span role="img" aria-label="Tiro a Puerta">🎯</span>
        </button>
        <button onClick={() => setSeleccionandoAccion({ tipo: 'TARJETA_AMARILLA' })} className="btn-accion-mini" title="Amarilla">
          <span role="img" aria-label="Amarilla">🟨</span>
        </button>
        <button onClick={() => setSeleccionandoAccion({ tipo: 'TARJETA_ROJA' })} className="btn-accion-mini" title="Roja">
          <span role="img" aria-label="Roja">🟥</span>
        </button>
        <button onClick={registrarGolEnContra} className="btn-accion-mini col-span-3" title="Gol Rival">
          <span role="img" aria-label="Gol Rival">🥅</span>
        </button>
      </div>
    </div>
  );

  const BanquilloPanel = () => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h4 className="font-bold mb-2">Banquillo ({suplentes.length})</h4>
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {suplentes.map(j => (
          <li key={j.id} className={`flex justify-between items-center p-2 rounded-md transition-colors cursor-pointer ${jugadorParaIntercambio?.id === j.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <span className="text-sm"><span className="font-bold w-6 inline-block">{j.numero_camiseta}</span> {j.nombre}</span>
            <button onClick={() => seleccionarParaIntercambio(j)} className="text-yellow-500 hover:text-yellow-600 text-sm font-semibold">
              {jugadorParaIntercambio?.id === j.id ? 'Cancelar' : 'Sustituir'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const FeedPanel = () => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h4 className="font-bold mb-2">Feed de Acciones</h4>
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {acciones.slice().reverse().map(accion => (
          <li key={accion.id} className="text-sm">
            <strong>{accion.minuto}'</strong> - {accion.tipo} - {accion.jugador_nombre}
          </li>
        ))}
      </ul>
    </div>
  );

  // Nueva organización compacta y clara
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Panel superior reorganizado: fase, tiempo, botones y selector de sistema táctico */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 bg-gradient-to-br from-gray-800 via-blue-900 to-gray-700 text-white px-2 py-1 rounded-lg shadow border border-black/10 min-h-[34px] max-h-[38px]">
        {/* Izquierda: Fase, tiempo y botones */}
        <div className="flex flex-row items-center gap-2 min-w-[120px] w-full sm:w-auto justify-center sm:justify-start">
          <span className="font-semibold text-xs bg-black/30 px-2 py-0.5 rounded">{fase === 'primer_tiempo' ? '1T' : fase === 'segundo_tiempo' ? '2T' : fase === 'descanso' ? 'Descanso' : fase === 'finalizado' ? 'Finalizado' : 'Preparación'}</span>
          <span className="font-mono font-bold text-sm bg-black/30 px-2 py-0.5 rounded" style={{ minWidth: '32px', textAlign: 'center' }}>
            <Cronometro segundos={segundosReloj} fase={fase} style={{ fontSize: '0.9rem', fontWeight: 'bold', lineHeight: '1' }} />
          </span>
          {/* Botones de control compactos */}
          {fase === 'preparacion' && (
            <button className="btn-control-vivo" style={{ padding: '0.08rem 0.4rem', fontSize: '0.75rem' }} onClick={() => cambiarFase('primer_tiempo')}>Iniciar</button>
          )}
          {fase === 'primer_tiempo' && (
            <>
              <button className="btn-control-vivo" style={{ padding: '0.08rem 0.4rem', fontSize: '0.75rem' }} onClick={() => setEnPausa(!enPausa)}>{enPausa ? 'Reanudar' : 'Pausar'}</button>
              <button className="btn-control-vivo" style={{ padding: '0.08rem 0.4rem', fontSize: '0.75rem' }} onClick={() => cambiarFase('descanso')}>Fin 1T</button>
            </>
          )}
          {fase === 'descanso' && (
            <button className="btn-control-vivo" style={{ padding: '0.08rem 0.4rem', fontSize: '0.75rem' }} onClick={() => cambiarFase('segundo_tiempo')}>Iniciar 2T</button>
          )}
          {fase === 'segundo_tiempo' && (
            <>
              <button className="btn-control-vivo" style={{ padding: '0.08rem 0.4rem', fontSize: '0.75rem' }} onClick={() => setEnPausa(!enPausa)}>{enPausa ? 'Reanudar' : 'Pausar'}</button>
              <button className="btn-control-vivo" style={{ padding: '0.08rem 0.4rem', fontSize: '0.75rem' }} onClick={() => cambiarFase('finalizado')}>Finalizar</button>
            </>
          )}
        </div>
        {/* Selector de sistema táctico: visible y accesible en móvil */}
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <label htmlFor="formacion-select" className="text-xs font-semibold">Sistema táctico:</label>
          <select
            id="formacion-select"
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-semibold border border-gray-300 dark:border-gray-700 focus:outline-none z-50 relative !pointer-events-auto !bg-white"
            value={formacion}
            onChange={e => {
              const nuevaFormacion = e.target.value;
              setFormacion(nuevaFormacion);
              const orden = ordenPosiciones[nuevaFormacion] || ordenPosiciones['4-3-3'];
              setTitulares(prev => {
                const titularesActuales = [...prev];
                const nuevosTitulares = titularesActuales.map((jugador, idx) => ({
                  ...jugador,
                  posicionCampo: orden[idx] || null,
                }));
                return nuevosTitulares.sort((a, b) => orden.indexOf(a.posicionCampo) - orden.indexOf(b.posicionCampo));
              });
            }}
            style={{ minWidth: 70, zIndex: 9999, position: 'relative', pointerEvents: 'auto', background: '#fff' }}
          >
            {Object.keys(ordenPosiciones).map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        {/* Equipos y resultado SIEMPRE ambos nombres, bien filtrados, en móvil debajo */}
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
          <span className="font-semibold text-xs truncate max-w-[80px]">
            {evento?.condicion === 'Local' ? evento?.nombre_equipo : evento?.rival || evento?.equipoRival}
          </span>
          <span className="font-bold text-sm tracking-wide leading-none">{marcador.local} <span className="mx-1">-</span> {marcador.visitante}</span>
          <span className="font-semibold text-xs truncate max-w-[80px]">
            {evento?.condicion === 'Local' ? evento?.rival || evento?.equipoRival : evento?.nombre_equipo}
          </span>
        </div>
      </div>
      {/* Distribución principal: campo de juego y banquillo con acciones en banda lateral */}
      <div className="flex flex-col md:flex-row gap-2 w-full">
        {/* Banda lateral de acciones rápidas */}
        <div className="hidden md:flex flex-col gap-2 justify-center items-center md:w-12 md:min-w-[48px] md:bg-gray-100 md:dark:bg-gray-800 md:p-2 md:rounded-lg md:shadow md:z-20">
          <button onClick={() => setSeleccionandoAccion({ tipo: 'GOL' })} title="Gol" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Gol">⚽</span></button>
          <button onClick={() => setSeleccionandoAccion({ tipo: 'ASISTENCIA' })} title="Asistencia" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Asistencia">🅰️</span></button>
          <button onClick={() => setSeleccionandoAccion({ tipo: 'TIRO_A_PUERTA' })} title="Tiro a Puerta" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Tiro a Puerta">🎯</span></button>
          <button onClick={() => setSeleccionandoAccion({ tipo: 'TARJETA_AMARILLA' })} title="Amarilla" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Amarilla">🟨</span></button>
          <button onClick={() => setSeleccionandoAccion({ tipo: 'TARJETA_ROJA' })} title="Roja" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Roja">🟥</span></button>
          <button onClick={registrarGolEnContra} title="Gol Rival" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Gol Rival">🥅</span></button>
        </div>
        {/* Campo de juego */}
        <div className="flex-1 flex flex-col justify-center items-center min-w-[260px]">
          <CampoDeJuego
            titulares={titulares}
            formacion={formacion}
            onJugadorClick={handleJugadorClickEnVivo}
            jugadorSeleccionadoId={jugadorParaIntercambio?.id}
            tiempoEnCampo={tiempoEnCampo}
            evaluaciones={evaluaciones}
            onMomentumChange={handleMomentumChange}
          />
          {/* Acciones rápidas en horizontal para móvil */}
          <div className="flex md:hidden flex-row flex-wrap gap-2 justify-center items-center mt-2">
            <button onClick={() => setSeleccionandoAccion({ tipo: 'GOL' })} title="Gol" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Gol">⚽</span></button>
            <button onClick={() => setSeleccionandoAccion({ tipo: 'ASISTENCIA' })} title="Asistencia" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Asistencia">🅰️</span></button>
            <button onClick={() => setSeleccionandoAccion({ tipo: 'TIRO_A_PUERTA' })} title="Tiro a Puerta" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Tiro a Puerta">🎯</span></button>
            <button onClick={() => setSeleccionandoAccion({ tipo: 'TARJETA_AMARILLA' })} title="Amarilla" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Amarilla">🟨</span></button>
            <button onClick={() => setSeleccionandoAccion({ tipo: 'TARJETA_ROJA' })} title="Roja" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Roja">🟥</span></button>
            <button onClick={registrarGolEnContra} title="Gol Rival" className="p-2 rounded-lg font-semibold text-xl transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"><span role="img" aria-label="Gol Rival">🥅</span></button>
          </div>
        </div>
        {/* Banquillo */}
        <div className="w-full md:w-1/3 max-w-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mt-2 md:mt-0">
          <h4 className="font-bold mb-2">Banquillo ({suplentes.length})</h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {suplentes.map(j => (
              <li key={j.id} className={`flex justify-between items-center p-2 rounded-md transition-colors cursor-pointer ${jugadorParaIntercambio?.id === j.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                <span className="text-sm"><span className="font-bold w-6 inline-block">{j.numero_camiseta}</span> {j.nombre}</span>
                <button onClick={() => seleccionarParaIntercambio(j)} className="text-yellow-500 hover:text-yellow-600 text-sm font-semibold">
                  {jugadorParaIntercambio?.id === j.id ? 'Cancelar' : 'Sustituir'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mt-2">
        <h4 className="font-bold mb-2">Feed de Acciones</h4>
        <ul className="space-y-2 max-h-32 overflow-y-auto">
          {acciones.slice().reverse().map(accion => (
            <li key={accion.id} className="text-sm">
              <strong>{accion.minuto}'</strong> - {accion.tipo} - {accion.jugador_nombre}
            </li>
          ))}
        </ul>
      </div>
      <style>{`
          .btn-control-vivo { display: inline-flex; align-items: center; gap: 0.5rem; color: white; font-weight: bold; padding: 0.3rem 0.7rem; border-radius: 0.5rem; background: linear-gradient(90deg, rgba(249,115,22,0.7), rgba(251,191,36,0.7), rgba(14,165,233,0.7)); border: 1px solid rgba(0,0,0,0.15); font-size: 0.85rem; }
        `}</style>
    </div>
  );

  // --- Renderizado Principal ---
=======
  const renderEnVivo = () => (
    <div className="space-y-5">
      <div className="bg-white/95 dark:bg-slate-900/85 p-3 md:p-4 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700/70">
        <div className="flex items-center justify-between gap-3 md:gap-4">
          <div className="flex-1" />

          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="flex flex-col items-center min-w-[68px]">
              <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Tu equipo</div>
              <div className="text-xl md:text-2xl font-black leading-tight">
                {evento.condicion === 'Local' ? marcador.local : marcador.visitante}
              </div>
            </div>
            <div className="text-lg md:text-xl font-black text-gray-400">-</div>
            <div className="flex flex-col items-center min-w-[68px]">
              <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Rival</div>
              <div className="text-xl md:text-2xl font-black leading-tight">
                {evento.condicion === 'Local' ? marcador.visitante : marcador.local}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 md:gap-2 flex-wrap">
            <div className="flex items-center justify-center px-2 py-0.5 bg-slate-100/80 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner scale-75 md:scale-85">
              <Cronometro
                segundos={segundosReloj}
                fase={fase}
                timeClass="text-lg md:text-xl"
                phaseClass="text-[10px]"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {fase === 'preparacion' && (
                <button onClick={() => cambiarFase('primer_tiempo')} className="btn-control-compact play">
                  <FaPlay /> Iniciar 1T
                </button>
              )}
              {fase === 'primer_tiempo' && (
                enPausa ? (
                  <button onClick={() => setEnPausa(false)} className="btn-control-compact play">
                    <FaPlay /> Reanudar
                  </button>
                ) : (
                  <button onClick={() => setEnPausa(true)} className="btn-control-compact warn">
                    <FaPause /> Pausar
                  </button>
                )
              )}
              {fase === 'primer_tiempo' && (
                <button onClick={() => cambiarFase('descanso')} className="btn-control-compact alt">
                  <FaFlag /> Descanso
                </button>
              )}
              {fase === 'descanso' && (
                <button onClick={() => cambiarFase('segundo_tiempo')} className="btn-control-compact play">
                  <FaPlay /> Iniciar 2T
                </button>
              )}
              {fase === 'segundo_tiempo' && (
                enPausa ? (
                  <button onClick={() => setEnPausa(false)} className="btn-control-compact play">
                    <FaPlay /> Reanudar
                  </button>
                ) : (
                  <button onClick={() => setEnPausa(true)} className="btn-control-compact warn">
                    <FaPause /> Pausar
                  </button>
                )
              )}
              {fase === 'segundo_tiempo' && (
                <button onClick={() => cambiarFase('finalizado')} className="btn-control-compact stop">
                  <FaStop /> Finalizar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-4 items-start">
        <div className="md:col-span-2 flex flex-col gap-3 order-2 md:order-1">
          <div className="bg-white/90 dark:bg-gray-800/80 p-3 rounded-lg shadow-sm border border-black/10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">
                Acciones de partido
              </h4>
              {seleccionandoAccion && (
                <button
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => setSeleccionandoAccion(null)}
                >
                  Cancelar
                </button>
              )}
            </div>
            <div className="flex md:grid md:grid-cols-1 xl:grid-cols-3 gap-1 md:gap-2 pt-1 overflow-x-auto md:overflow-visible">
              <button onClick={() => setSeleccionandoAccion({ tipo: 'GOL' })} className="btn-accion-icono text-slate-900 dark:text-slate-100 shrink-0" aria-label="Gol" title="Gol">
                <FaFutbol className="icon-svg text-green-600" />
              </button>
              <button onClick={() => setSeleccionandoAccion({ tipo: 'ASISTENCIA' })} className="btn-accion-icono text-slate-900 dark:text-slate-100 shrink-0" aria-label="Asistencia" title="Asistencia">
                <FaHandHolding className="icon-svg text-sky-600" />
              </button>
              <button onClick={() => setSeleccionandoAccion({ tipo: 'TIRO_A_PUERTA' })} className="btn-accion-icono text-slate-900 dark:text-slate-100 shrink-0" aria-label="Tiro a puerta" title="Tiro a puerta">
                <FaBullseye className="icon-svg text-orange-500" />
              </button>
              <button onClick={() => setSeleccionandoAccion({ tipo: 'CORNERS' })} className="btn-accion-icono text-slate-900 dark:text-slate-100 shrink-0" aria-label="Corner" title="Corner">
                <FaFlagCheckered className="icon-svg text-indigo-600" />
              </button>
              <button onClick={() => setSeleccionandoAccion({ tipo: 'AMARILLA' })} className="btn-accion-icono text-slate-900 dark:text-slate-100 shrink-0" aria-label="Tarjeta amarilla" title="Tarjeta amarilla">
                <FaSquareFull className="icon-svg text-yellow-400" />
              </button>
              <button onClick={() => setSeleccionandoAccion({ tipo: 'ROJA' })} className="btn-accion-icono text-slate-900 dark:text-slate-100 shrink-0" aria-label="Tarjeta roja" title="Tarjeta roja">
                <FaSquareFull className="icon-svg text-red-500" />
              </button>
              <button onClick={registrarGolEnContra} className="btn-accion-icono text-slate-900 dark:text-slate-100 shrink-0" aria-label="Gol en contra" title="Gol en contra">
                <FaExclamationTriangle className="icon-svg text-amber-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 order-1 md:order-2">
          <div className="w-full max-w-4xl mx-auto aspect-[3/2]">
            <CampoDeJuego
              titulares={titulares}
              formacion={formacion}
              onJugadorClick={handleJugadorClickEnVivo}
              jugadorSeleccionadoId={jugadorParaIntercambio?.id}
              tiempoEnCampo={tiempoEnCampo}
              evaluaciones={evaluaciones}
              onMomentumChange={handleMomentumChange}
            />
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4 order-3">
          <div className="border border-black/10 dark:border-black/20 rounded-lg p-3 bg-white/80 dark:bg-gray-800/80">
            <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200">Banquillo ({suplentes.length})</h4>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {suplentes.map(j => (
                <li
                  key={j.id}
                  className={`suplente-card ${jugadorParaIntercambio?.id === j.id ? 'selected' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {j.numero_camiseta ? `${j.numero_camiseta} ` : ''}{j.nombre}
                    </span>
                    {tiempoEnCampo[j.id] > 0 && (
                      <span className="chip-tiempo">{formatTime(tiempoEnCampo[j.id])}</span>
                    )}
                  </div>
                  <button onClick={() => seleccionarParaIntercambio(j)} className="icono-sustituir">
                    {jugadorParaIntercambio?.id === j.id ? 'Cancelar' : 'Sustituir'}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/80 p-3 rounded-lg shadow-sm border border-black/10">
            <h4 className="font-bold mb-3 text-gray-800 dark:text-gray-200 text-sm uppercase">Feed de acciones</h4>
            <ul className="space-y-2 max-h-72 overflow-y-auto text-sm">
              {acciones.slice().reverse().map(accion => (
                <li key={accion.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/40 rounded-md border border-gray-200/70 dark:border-gray-700/60">
                  <span className="font-bold text-gray-700 dark:text-gray-100">{accion.minuto}'</span>
                  <span className="text-gray-800 dark:text-gray-200">{accion.tipo} - {accion.jugador_nombre}</span>
                </li>
              ))}
              {acciones.length === 0 && <p className="text-gray-500 text-center">Sin acciones registradas.</p>}
            </ul>
          </div>
        </div>
      </div>
      <style>{`
        .btn-control-compact { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.65rem; border-radius: 0.6rem; font-weight: 700; font-size: 0.86rem; border: 1px solid rgba(0,0,0,0.08); background: linear-gradient(120deg, #f8fafc, #e2e8f0); color: #0f172a; }
        .btn-control-compact.play { background: #22c55e; color: #fff; border-color: #16a34a; }
        .btn-control-compact.warn { background: #fbbf24; color: #1f2937; border-color: #f59e0b; }
        .btn-control-compact.alt { background: #38bdf8; color: #0f172a; border-color: #0ea5e9; }
        .btn-control-compact.stop { background: #ef4444; color: #fff; border-color: #dc2626; }
        .btn-control-compact:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(15,23,42,0.15); }

        .btn-accion-icono { display: inline-flex; align-items: center; justify-content: center; width: auto; min-height: 28px; padding: 0.28rem 0.35rem; border-radius: 11px; border: 1px solid #e2e8f0; background: linear-gradient(160deg, #ffffff, #f8fafc); box-shadow: 0 3px 8px rgba(15,23,42,0.08); transition: all 0.2s ease; color: #0f172a; }
        .btn-accion-icono:hover { transform: translateY(-1px) scale(1.02); border-color: #cbd5e1; box-shadow: 0 8px 16px rgba(15,23,42,0.12); }
        .btn-accion-icono:active { transform: translateY(0); box-shadow: 0 4px 12px rgba(15,23,42,0.12); }
        .btn-accion-icono .icon-svg { width: 12px; height: 12px; display: block; flex-shrink: 0; }
        @media (min-width: 768px) {
          .btn-accion-icono { width: 100%; min-height: 38px; padding: 0.4rem 0.5rem; }
          .btn-accion-icono .icon-svg { width: 16px; height: 16px; }
        }
        .dark .btn-accion-icono { background: linear-gradient(160deg, #111827, #1f2937); border-color: #334155; box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
        .dark .btn-accion-icono:hover { border-color: #475569; box-shadow: 0 12px 22px rgba(0,0,0,0.45); }

        .suplente-card { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.65rem; border-radius: 0.6rem; border: 1px solid #e2e8f0; background: #f8fafc; }
        .suplente-card.selected { border-color: #38bdf8; background: #e0f2fe; }
        .dark .suplente-card { background: #1f2937; border-color: #334155; }
        .dark .suplente-card.selected { background: #0ea5e9; border-color: #0284c7; color: #0b1220; }

        .chip-tiempo { font-size: 10px; font-weight: 700; background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 999px; }
        .dark .chip-tiempo { background: #334155; color: #cbd5e1; }

        .icono-sustituir { font-size: 11px; font-weight: 700; color: #0ea5e9; padding: 4px 8px; border-radius: 0.5rem; border: 1px solid #cbd5e1; background: #fff; }
        .icono-sustituir:hover { background: #e0f2fe; border-color: #38bdf8; }
        .dark .icono-sustituir { background: #0f172a; border-color: #334155; color: #7dd3fc; }
        .dark .icono-sustituir:hover { background: #0ea5e9; color: #0b1220; }

        @media (max-width: 900px) {
          .suplente-card { padding: 0.45rem 0.6rem; }
          .suplente-card span { font-size: 0.85rem; }
          .icono-sustituir { font-size: 10px; padding: 3.5px 7px; }
        }
      `}</style>
    </div>
  );

// --- Renderizado Principal ---
>>>>>>> 30b9da69e731d89e8faf6460634ba38b54959dde
  if (loading) {
    return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Cargando evento...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <Link to="/eventos" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Volver a Eventos
        </Link>
      </div>
    );
  }

  if (!evento) {
    return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Evento no encontrado.</div>;
  }

  // Si es ENTRENAMIENTO, mostrar vista simplificada
  if (evento.tipo === 'entrenamiento') {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-black overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] bg-[size:26px_26px] opacity-40 dark:bg-[radial-gradient(circle_at_1px_1px,#0f172a_1px,transparent_0)]"></div>
        <div className="pointer-events-none absolute -top-40 -left-32 w-80 h-80 bg-orange-400/15 blur-3xl rounded-full"></div>
        <div className="pointer-events-none absolute -bottom-48 -right-32 w-96 h-96 bg-sky-400/15 blur-3xl rounded-full"></div>
        <div className="relative z-10 space-y-6">
          {/* Encabezado del Evento */}
          <div className="bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-lg shadow-md border border-black/10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{evento.titulo}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold capitalize">
                    <strong>Tipo:</strong> ⚽ Entrenamiento
                  </span>
                  <span><strong>Fecha:</strong> {formatearFecha(evento.fecha)}</span>
                  {evento.ubicacion && <span><strong>Ubicación:</strong> {evento.ubicacion}</span>}
                </div>
              </div>
              <Link
                to="/eventos"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ← Volver
              </Link>
            </div>
          </div>

          {/* Descripción */}
          {evento.descripcion && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Descripción</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{evento.descripcion}</p>
            </div>
          )}

          {/* Asistencia */}
          <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-md border border-black/10">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Asistencia</h3>

            {convocados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {convocados.map(jugador => (
                  <div
                    key={jugador.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-8 text-center">{jugador.numero_camiseta}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{jugador.nombre} {jugador.apellidos}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{jugador.posicion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay asistentes registrados aún.</p>
            )}

            {!evento.evaluado && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('asistencia')}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                  Gestionar Asistencia
                </button>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-md border border-black/10">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Observaciones del Entrenamiento</h3>
              <textarea
                value={evento.observaciones || ''}
                onChange={(e) => {
                  setEvento({ ...evento, observaciones: e.target.value });
                  // setObservacionGuardada(false); // Esta lógica debe estar en el componente que maneja el estado
                }}
                placeholder="Escribe aquá tus observaciones sobre el entrenamiento (ejercicios realizados, aspectos a mejorar, etc.)..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all min-h-[120px] max-h-60"
              />
              <div className="flex items-center gap-4 mt-2">
                <button
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  style={{ minWidth: 160 }}
                  disabled={observacionGuardada || loadingObservacion}
                  onClick={async () => {
                    setLoadingObservacion(true);
                    try {
                      const eventoRef = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
                      await updateDoc(eventoRef, { observaciones: evento.observaciones || '' });
                      setObservacionGuardada(true);
                    } catch (error) {
                      setObservacionGuardada(false);
                      setErrorObservacion('No se pudo guardar. Intenta de nuevo.');
                    } finally {
                      setLoadingObservacion(false);
                    }
                  }}
                >
                  {loadingObservacion ? 'Guardando...' : observacionGuardada ? 'Guardado ✓' : 'Guardar observaciones'}
                </button>
                {observacionGuardada && (
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">Guardado correctamente</span>
                )}
                {errorObservacion && (
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">{errorObservacion}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recuerda guardar tus observaciones antes de salir.</p>
            </div>
          </div>

          {/* Modal de Asistencia */}
          {activeTab === 'asistencia' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gestión de Asistencia</h3>
                  <button
                    onClick={() => setActiveTab(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6">
                  {renderConvocatoria()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista completa para PARTIDOS
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-black overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] bg-[size:26px_26px] opacity-40 dark:bg-[radial-gradient(circle_at_1px_1px,#0f172a_1px,transparent_0)]"></div>
      <div className="pointer-events-none absolute -top-40 -left-32 w-80 h-80 bg-orange-400/15 blur-3xl rounded-full"></div>
      <div className="pointer-events-none absolute -bottom-48 -right-32 w-96 h-96 bg-sky-400/15 blur-3xl rounded-full"></div>
      <div className="relative z-10 space-y-6">
        {/* Encabezado del Evento */}
        <div className="bg-gradient-to-br from-orange-500/40 via-amber-400/40 to-sky-500/40 p-6 rounded-lg shadow-md border border-black/10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{evento.titulo}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold capitalize"><strong>Tipo:</strong> {evento.tipo}</span>
            <span><strong>Fecha:</strong> {formatearFecha(evento.fecha)}</span>
            {evento.ubicacion && <span><strong>Ubicación:</strong> {evento.ubicacion}</span>}
            {evento.tipo === 'partido' && evento.equipoRival && <span><strong>Rival:</strong> {evento.equipoRival}</span>}
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md border border-black/10">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="p-4 flex flex-nowrap md:flex-wrap items-center gap-2 w-full overflow-x-auto md:overflow-visible min-w-full" aria-label="Tabs">
              {/* Convocatoria: Solo visible si el partido no ha finalizado */}
              <TabButton
                tabName="convocatoria"
                disabled={partidoFinalizado || partidoIniciado}
              >
                Convocatoria {partidoIniciado && '🔒'}
              </TabButton>

              {/* Alineación: Solo visible si el partido no ha finalizado */}
              <TabButton
                tabName="alineacion"
                disabled={partidoFinalizado || partidoIniciado}
              >
                Alineación {partidoIniciado && '🔒'}
              </TabButton>

              {/* En Vivo: Solo visible si el partido NO ha finalizado */}
              {!partidoFinalizado && (
                <TabButton tabName="envivo">
                  {partidoIniciado ? '🔴 En Vivo' : '⏱️ Iniciar Partido'}
                </TabButton>
              )}

              {/* Evaluación: Siempre visible, pero destacado si finalizó */}
              <TabButton
                tabName="evaluacion"
                onClick={sincronizarStatsParaEvaluacion}
              >
                {partidoFinalizado ? '✅ Resumen Final' : '📊 Evaluación'}
              </TabButton>

              <Link to="/eventos" className="ml-auto px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md whitespace-nowrap flex-none">
                ← Volver
              </Link>
            </nav>
          </div>

          {/* Mensaje informativo según estado */}
          {partidoFinalizado && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300 font-semibold text-center">
                ✅ Partido finalizado - Solo puedes ver el resumen y estadásticas finales
              </p>
            </div>
          )}

          {partidoIniciado && !partidoFinalizado && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold text-center">
                🔴 Partido en curso - No se pueden modificar convocatoria ni alineación
              </p>
            </div>
          )}

          {/* Contenido de las Pestañas */}
          <div className="p-4 md:p-6">
            {activeTab === 'convocatoria' && renderConvocatoria()}
            {activeTab === 'alineacion' && renderAlineacion()}
            {activeTab === 'envivo' && renderEnVivo()}
            {activeTab === 'evaluacion' && renderEvaluacion()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleEvento;
