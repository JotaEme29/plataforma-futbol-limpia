// src/pages/DetalleEventoClub.jsx - Detalle + gestión del evento (v2)

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Cronometro from '../components/Cronometro';
import CampoDeJuego from '../components/CampoDeJuego';
import useInterval from '../hooks/useInterval';
import { ordenPosiciones } from '../../config/formaciones.js';

function DetalleEventoClub() {
  const { eventoId } = useParams();
  const { currentUser } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('convocatoria');
  const [jugadores, setJugadores] = useState([]);
  const [convocados, setConvocados] = useState([]);
  const [noConvocados, setNoConvocados] = useState([]);
  const [formacion, setFormacion] = useState('4-3-3');
  const [titulares, setTitulares] = useState([]);
  const [suplentes, setSuplentes] = useState([]);
  const [suplenteSeleccionadoId, setSuplenteSeleccionadoId] = useState('');
  const [enPausa, setEnPausa] = useState(true);
  const [fase, setFase] = useState('preparacion'); // preparacion | primer_tiempo | segundo_tiempo | finalizado
  const [segundosReloj, setSegundosReloj] = useState(0);
  const [segundosAcumulados, setSegundosAcumulados] = useState(0);
  const [tiempoEnCampo, setTiempoEnCampo] = useState({});
  const [acciones, setAcciones] = useState([]);
  const [nuevaAccion, setNuevaAccion] = useState({ tipo: 'GOL', jugadorPrincipal: '', jugadorSecundario: '' });
  const [evaluaciones, setEvaluaciones] = useState({});

  // Cargar evento
  useEffect(() => {
    const cargarEvento = async () => {
      if (!currentUser?.clubId) {
        setError('No se ha podido determinar el club actual.');
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('Evento no encontrado.');
        } else {
          const data = { id: snap.id, ...snap.data() };
          setEvento(data);
          if (data.evaluado) {
            setActiveTab('evaluacion');
          }
        }
      } catch (e) {
        console.error('Error cargando evento:', e);
        setError('No se pudo cargar el evento.');
      } finally {
        setLoading(false);
      }
    };
    cargarEvento();
  }, [eventoId, currentUser]);

  // Cargar jugadores del equipo y setear convocatoria
  useEffect(() => {
    const cargarJugadores = async () => {
      if (!currentUser?.clubId || !evento?.equipoId) return;
      try {
        const ref = collection(db, 'clubes', currentUser.clubId, 'equipos', evento.equipoId, 'jugadores');
        const snapshot = await getDocs(ref);
        const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data(), dorsal: d.data().numeroCamiseta }));
        setJugadores(lista);
        const idsConv = Array.isArray(evento.convocados) ? evento.convocados : [];
        const titIds = Array.isArray(evento.alineacion_titular) ? evento.alineacion_titular : [];
        const banqIds = Array.isArray(evento.banquillo) ? evento.banquillo : [];

        // Helper para asignar posiciones según formación
        const asignarPosiciones = (jugArr) => {
          const orden = ordenPosiciones[formacion] || ordenPosiciones['4-3-3'];
          return jugArr.map((j, idx) => ({ ...j, posicionCampo: orden[idx] }));
        };

        if (titIds.length > 0 || banqIds.length > 0) {
          // Cargar alineación guardada
          const tits = titIds.map(id => lista.find(j => j.id === id)).filter(Boolean);
          const banq = banqIds.map(id => lista.find(j => j.id === id)).filter(Boolean);
          setTitulares(asignarPosiciones(tits));
          setSuplentes(banq);
          // Convocatoria derivada
          const convAll = [...tits, ...banq].map(j => j.id);
          setConvocados(lista.filter(j => convAll.includes(j.id)));
          setNoConvocados(lista.filter(j => !convAll.includes(j.id)));
        } else if (idsConv.length > 0) {
          const convocadosLista = lista.filter(j => idsConv.includes(j.id));
          const noConv = lista.filter(j => !idsConv.includes(j.id));
          setConvocados(convocadosLista);
          setNoConvocados(noConv);
          setSuplentes(convocadosLista);
        } else {
          // Sin convocatoria previa: mostrar a todos como suplentes por defecto
          setConvocados(lista);
          setNoConvocados([]);
          setSuplentes(lista);
        }
      } catch (e) {
        console.error('Error cargando jugadores:', e);
      }
    };
    cargarJugadores();
  }, [evento, currentUser]);

  // Reasignar posiciones cuando cambia la formación
  useEffect(() => {
    if (titulares.length === 0) return;
    const orden = ordenPosiciones[formacion] || ordenPosiciones['4-3-3'];
    setTitulares(prev => prev.map((j, idx) => ({ ...j, posicionCampo: orden[idx] })));
  }, [formacion]);

  // Acciones en vivo
  useEffect(() => {
    if (!currentUser?.clubId || !eventoId) return;
    const accionesRef = collection(db, 'clubes', currentUser.clubId, 'eventos', eventoId, 'acciones');
    const q = query(accionesRef, orderBy('timestamp'));
    const unsub = onSnapshot(q, (qs) => {
      setAcciones(qs.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub && unsub();
  }, [currentUser, eventoId]);

  const formatearFecha = (f) => {
    try {
      const d = f?.toDate ? f.toDate() : new Date(f);
      return d.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Contador de minutos por jugador en campo
  useInterval(() => {
    if (enPausa || fase === 'preparacion' || fase === 'finalizado') return;
    setTiempoEnCampo(prev => {
      const nuevo = { ...prev };
      titulares.forEach(j => { nuevo[j.id] = (nuevo[j.id] || 0) + 1; });
      return nuevo;
    });
  }, enPausa ? null : 1000);

  const minutoActual = useMemo(() => Math.floor((segundosAcumulados + segundosReloj) / 60), [segundosAcumulados, segundosReloj]);

  // Convocatoria
  const guardarConvocatoria = async () => {
    try {
      const ids = convocados.map(j => j.id);
      const ref = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
      await updateDoc(ref, { convocados: ids });
      alert('Convocatoria guardada');
    } catch (e) {
      console.error(e);
      alert('Error al guardar la convocatoria');
    }
  };

  const moverConvocado = (jugador, aConv) => {
    if (aConv) {
      setNoConvocados(noConvocados.filter(j => j.id !== jugador.id));
      setConvocados([...convocados, jugador]);
    } else {
      setConvocados(convocados.filter(j => j.id !== jugador.id));
      setNoConvocados([...noConvocados, jugador]);
      setTitulares(titulares.filter(t => t.id !== jugador.id));
      setSuplentes(suplentes.filter(s => s.id !== jugador.id));
    }
  };

  // Alineación
  const agregarTitular = (jugador) => {
    if (titulares.length >= 11) { alert('Máximo 11 titulares'); return; }
    const orden = ordenPosiciones[formacion] || ordenPosiciones['4-3-3'];
    const posLibre = orden.find(pos => !titulares.some(t => t.posicionCampo === pos));
    const jugadorPos = { ...jugador, posicionCampo: posLibre };
    setTitulares([...titulares, jugadorPos]);
    setSuplentes(suplentes.filter(s => s.id !== jugador.id));
  };

  const quitarTitular = (jugador) => {
    const copia = { ...jugador }; delete copia.posicionCampo;
    setTitulares(titulares.filter(t => t.id !== jugador.id));
    setSuplentes([...suplentes, copia]);
  };

  // Click en titular: si hay suplente seleccionado, hacemos cambio; si no, quitamos.
  const handleTitularClick = (jugador) => {
    if (suplenteSeleccionadoId) {
      const supl = suplentes.find(s => s.id === suplenteSeleccionadoId);
      if (!supl) { setSuplenteSeleccionadoId(''); return; }
      // Reemplazar en misma posición
      const pos = jugador.posicionCampo;
      const nuevoTit = { ...supl, posicionCampo: pos };
      const nuevosTitulares = titulares.map(t => t.id === jugador.id ? nuevoTit : t);
      setTitulares(nuevosTitulares);
      setSuplentes(suplentes.filter(s => s.id !== suplenteSeleccionadoId).concat({ ...jugador, posicionCampo: undefined }));
      setSuplenteSeleccionadoId('');
    } else {
      quitarTitular(jugador);
    }
  };

  // Drag & Drop: soltar jugador (titular o suplente) en una posición
  const handleDropOnPosition = (pos, jugadorId) => {
    const esTitular = titulares.some(t => t.id === jugadorId);
    const esSuplente = suplentes.some(s => s.id === jugadorId);
    const ocupante = titulares.find(t => t.posicionCampo === pos) || null;

    if (esTitular) {
      // Mover o intercambiar entre titulares
      const mov = titulares.find(t => t.id === jugadorId);
      if (!mov) return;
      if (!ocupante || ocupante.id === mov.id) {
        setTitulares(titulares.map(t => t.id === mov.id ? { ...t, posicionCampo: pos } : t));
      } else {
        // swap posiciones
        const posMov = mov.posicionCampo;
        const posOcu = ocupante.posicionCampo;
        setTitulares(titulares.map(t => {
          if (t.id === mov.id) return { ...t, posicionCampo: posOcu };
          if (t.id === ocupante.id) return { ...t, posicionCampo: posMov };
          return t;
        }));
      }
      return;
    }

    if (esSuplente) {
      const sup = suplentes.find(s => s.id === jugadorId);
      if (!sup) return;
      if (ocupante) {
        // reemplazo: ocupante baja a suplentes, suplente entra al campo
        const nuevoTit = { ...sup, posicionCampo: pos };
        setTitulares(titulares.map(t => t.id === ocupante.id ? nuevoTit : t));
        setSuplentes(suplentes.filter(s => s.id !== sup.id).concat({ ...ocupante, posicionCampo: undefined }));
      } else {
        if (titulares.length >= 11) { alert('Campo lleno: arrastra sobre un titular para cambiar.'); return; }
        const nuevoTit = { ...sup, posicionCampo: pos };
        setTitulares([...titulares, nuevoTit]);
        setSuplentes(suplentes.filter(s => s.id !== sup.id));
      }
      return;
    }
  };

  // Drop en zona de suplentes: cualquier titular arrastrado cae al banquillo
  const handleDropOnSuplentes = (jugadorId) => {
    const mov = titulares.find(t => t.id === jugadorId);
    if (!mov) return;
    const copia = { ...mov }; delete copia.posicionCampo;
    setTitulares(titulares.filter(t => t.id !== jugadorId));
    setSuplentes([...suplentes, copia]);
  };

  const guardarAlineacion = async () => {
    try {
      const titIds = titulares.map(t => t.id);
      const banqIds = suplentes.map(s => s.id);
      const ref = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
      await updateDoc(ref, { alineacion_titular: titIds, banquillo: banqIds });
      alert('Alineación guardada');
    } catch (e) {
      console.error(e);
      alert('Error al guardar alineación');
    }
  };

  // Cronómetro
  const iniciarPrimerTiempo = () => { setFase('primer_tiempo'); setSegundosReloj(0); setSegundosAcumulados(0); setEnPausa(false); setActiveTab('envivo'); };
  const iniciarSegundoTiempo = () => { setFase('segundo_tiempo'); setSegundosReloj(0); setEnPausa(false); };
  const pausar = () => setEnPausa(true);
  const reanudar = () => setEnPausa(false);
  const onTiempoActualizado = (seg) => setSegundosReloj(seg);
  const terminarTiempo = () => { setSegundosAcumulados(prev => prev + segundosReloj); setEnPausa(true); };

  // Acciones
  const crearAccion = async () => {
    if (!nuevaAccion.jugadorPrincipal) { alert('Selecciona jugador'); return; }
    try {
      const accionesRef = collection(db, 'clubes', currentUser.clubId, 'eventos', eventoId, 'acciones');
      await addDoc(accionesRef, {
        tipo: nuevaAccion.tipo,
        minuto: minutoActual,
        jugador_principal_id: nuevaAccion.jugadorPrincipal,
        jugador_secundario_id: nuevaAccion.jugadorSecundario || null,
        timestamp: new Date()
      });
      setNuevaAccion({ tipo: nuevaAccion.tipo, jugadorPrincipal: '', jugadorSecundario: '' });
    } catch (e) {
      console.error(e);
      alert('No se pudo registrar la acción');
    }
  };

  // Finalizar y guardar stats
  const finalizarYGuardarStats = async () => {
    try {
      setEnPausa(true);
      const totalSeg = segundosAcumulados + segundosReloj;
      const accionesRef = collection(db, 'clubes', currentUser.clubId, 'eventos', eventoId, 'acciones');
      const qs = await getDocs(accionesRef);
      const accs = qs.docs.map(d => d.data());
      const porJugador = {};
      convocados.forEach(j => { porJugador[j.id] = { goles: 0, asistencias: 0, amarillas: 0, rojas: 0, minutos: 0 }; });
      accs.forEach(a => {
        if (!a.jugador_principal_id) return;
        const jid = a.jugador_principal_id;
        if (!porJugador[jid]) porJugador[jid] = { goles: 0, asistencias: 0, amarillas: 0, rojas: 0, minutos: 0 };
        switch (a.tipo) {
          case 'GOL': porJugador[jid].goles += 1; break;
          case 'ASISTENCIA': if (a.jugador_secundario_id) {
            porJugador[a.jugador_secundario_id] = porJugador[a.jugador_secundario_id] || { goles:0, asistencias:0, amarillas:0, rojas:0, minutos:0 }; porJugador[a.jugador_secundario_id].asistencias += 1; } break;
          case 'AMARILLA': porJugador[jid].amarillas += 1; break;
          case 'ROJA': porJugador[jid].rojas += 1; break;
          default: break;
        }
      });
      Object.keys(tiempoEnCampo).forEach(jid => { const min = Math.floor((tiempoEnCampo[jid] || 0) / 60); porJugador[jid] = porJugador[jid] || { goles:0, asistencias:0, amarillas:0, rojas:0, minutos:0 }; porJugador[jid].minutos += min; });
      for (const jid of Object.keys(porJugador)) {
        const stats = porJugador[jid];
        const jref = doc(db, 'clubes', currentUser.clubId, 'equipos', evento.equipoId, 'jugadores', jid);
        await updateDoc(jref, {
          'estadisticas.goles': increment(stats.goles),
          'estadisticas.asistencias': increment(stats.asistencias),
          'estadisticas.tarjetasAmarillas': increment(stats.amarillas),
          'estadisticas.tarjetasRojas': increment(stats.rojas),
          'estadisticas.minutosJugados': increment(stats.minutos),
        });
      }
      const eref = doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId);
      await updateDoc(eref, { estado: 'finalizado', duracionRealMin: Math.floor(totalSeg / 60) });
      alert('Partido finalizado y estadísticas guardadas');
      setFase('finalizado');
    } catch (e) {
      console.error(e);
      alert('No se pudieron guardar estadísticas');
    }
  };

  // Evaluaciones
  const guardarEvaluaciones = async () => {
    try {
      const entries = Object.entries(evaluaciones);
      for (const [jugadorId, vals] of entries) {
        await addDoc(collection(db, 'evaluaciones'), {
          id_evento: eventoId,
          id_jugador: jugadorId,
          clubId: currentUser.clubId,
          equipoId: evento.equipoId,
          fecha_evento: (evento?.fecha?.toDate ? evento.fecha.toDate() : new Date()).toISOString().slice(0,10),
          ...vals
        });
      }
      // Marcar evento como evaluado para bloquear futuras convocatorias
      await updateDoc(doc(db, 'clubes', currentUser.clubId, 'eventos', eventoId), { evaluado: true });
      setEvento(prev => ({ ...prev, evaluado: true }));
      alert('Evaluaciones guardadas');
    } catch (e) {
      console.error(e);
      alert('Error al guardar evaluaciones');
    }
  };

  if (loading) return <div className="card">Cargando evento...</div>;
  if (error) return (
    <div className="card">
      <p>{error}</p>
      <Link to="/dashboard-club"><button>Volver</button></Link>
    </div>
  );
  if (!evento) return null;

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>{evento.titulo}</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span><strong>Tipo:</strong> {evento.tipo}</span>
          <span><strong>Fecha:</strong> {formatearFecha(evento.fecha)}</span>
          {evento.ubicacion && <span><strong>Ubicación:</strong> {evento.ubicacion}</span>}
          {evento.tipo === 'partido' && evento.equipoRival && <span><strong>Rival:</strong> {evento.equipoRival}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!(evento?.evaluado) && (<>
            <button onClick={() => setActiveTab('convocatoria')} className={activeTab==='convocatoria' ? 'active' : ''}>Convocatoria</button>
            <button onClick={() => setActiveTab('alineacion')} className={activeTab==='alineacion' ? 'active' : ''}>Alineación</button>
          </>)}
          <button onClick={() => setActiveTab('envivo')} className={activeTab==='envivo' ? 'active' : ''}>En vivo</button>
          <button onClick={() => setActiveTab('evaluacion')} className={activeTab==='evaluacion' ? 'active' : ''}>Evaluación</button>
          <Link to="/dashboard-club" style={{ marginLeft: 'auto' }}><button>Volver</button></Link>
        </div>
      </div>

      {/* Convocatoria */}
      {activeTab === 'convocatoria' && !evento?.evaluado && (
        <div className="card">
          <h3>Convocatoria</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4>No Convocados</h4>
              {noConvocados.map(j => (
                <div key={j.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                  <span>#{j.numeroCamiseta} {j.nombre} {j.apellido}</span>
                  <button onClick={() => moverConvocado(j, true)}>Añadir</button>
                </div>
              ))}
            </div>
            <div>
              <h4>Convocados</h4>
              {convocados.map(j => (
                <div key={j.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                  <span>#{j.numeroCamiseta} {j.nombre} {j.apellido}</span>
                  <button onClick={() => moverConvocado(j, false)}>Quitar</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop:'1rem' }}>
            <button onClick={guardarConvocatoria}>Guardar Convocatoria</button>
          </div>
        </div>
      )}

      {/* Alineación */}
      {activeTab === 'alineacion' && (
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3>Alineación y Suplentes</h3>
            <div>
              <label>Formación: </label>
              <select value={formacion} onChange={e=>setFormacion(e.target.value)}>
                {['4-3-3','4-4-2','3-5-2','4-2-3-1'].map(f=> <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <CampoDeJuego titulares={titulares} onJugadorClick={handleTitularClick} onDropPosition={handleDropOnPosition} formacion={formacion} tiempoEnCampo={tiempoEnCampo} />
          <h4>Suplentes</h4>
          <div
            style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', padding:'8px', border:'1px dashed #ccc', borderRadius:'8px' }}
            onDragOver={(e)=>e.preventDefault()}
            onDrop={(e)=>{ const id=e.dataTransfer.getData('text/plain'); if(id) handleDropOnSuplentes(id); }}
          >
            {suplentes
              .slice()
              .sort((a,b)=> (a.numeroCamiseta||0)-(b.numeroCamiseta||0))
              .map(j => (
                <button
                  key={j.id}
                  onClick={() => suplenteSeleccionadoId===j.id ? setSuplenteSeleccionadoId('') : setSuplenteSeleccionadoId(j.id)}
                  draggable
                  onDragStart={(e)=>{ e.dataTransfer.setData('text/plain', j.id); e.dataTransfer.effectAllowed='move'; }}
                  style={{ border: suplenteSeleccionadoId===j.id ? '2px solid #2563eb' : undefined }}
                >
                  #{j.numeroCamiseta} {j.nombre}
                </button>
              ))}
          </div>
          <div style={{ marginTop:'1rem', display:'flex', gap:'0.5rem' }}>
            <button onClick={guardarAlineacion}>Guardar Alineación</button>
            <span style={{ color:'#666' }}>Titulares: {titulares.length} · Suplentes: {suplentes.length}</span>
          </div>
          {titulares.length < 11 && <p style={{ color:'#666', marginTop:'0.5rem' }}>Añade {11 - titulares.length} titulares.</p>}
        </div>
      )}

      {/* En vivo */}
      {activeTab === 'envivo' && (
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
            <Cronometro enPausa={enPausa} onTiempoActualizado={onTiempoActualizado} fase={fase} />
            <span>Min {minutoActual}'</span>
            {fase==='preparacion' && <button onClick={iniciarPrimerTiempo}>Iniciar 1T</button>}
            {fase!=='preparacion' && fase!=='finalizado' && (enPausa ? <button onClick={reanudar}>Reanudar</button> : <button onClick={pausar}>Pausar</button>)}
            {fase==='primer_tiempo' && <button onClick={()=>{terminarTiempo(); iniciarSegundoTiempo();}}>Iniciar 2T</button>}
            {fase==='segundo_tiempo' && <button onClick={terminarTiempo}>Terminar 2T</button>}
            <button onClick={finalizarYGuardarStats} disabled={fase==='finalizado'}>Finalizar Partido</button>
          </div>

          <CampoDeJuego titulares={titulares} onJugadorClick={handleTitularClick} onDropPosition={handleDropOnPosition} formacion={formacion} tiempoEnCampo={tiempoEnCampo} />

          <div style={{ marginTop:'1rem' }}>
            <h4>Registrar acción</h4>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
              <select value={nuevaAccion.tipo} onChange={e=>setNuevaAccion(a=>({...a, tipo:e.target.value}))}>
                <option>GOL</option>
                <option>ASISTENCIA</option>
                <option>AMARILLA</option>
                <option>ROJA</option>
              </select>
              <select value={nuevaAccion.jugadorPrincipal} onChange={e=>setNuevaAccion(a=>({...a, jugadorPrincipal:e.target.value}))}>
                <option value="">Jugador principal</option>
                {convocados.map(j=> <option key={j.id} value={j.id}>#{j.numeroCamiseta} {j.nombre}</option>)}
              </select>
              <select value={nuevaAccion.jugadorSecundario} onChange={e=>setNuevaAccion(a=>({...a, jugadorSecundario:e.target.value}))}>
                <option value="">Jugador secundario (opcional)</option>
                {convocados.map(j=> <option key={j.id} value={j.id}>#{j.numeroCamiseta} {j.nombre}</option>)}
              </select>
              <button onClick={crearAccion}>Agregar</button>
            </div>

            <div style={{ marginTop:'1rem' }}>
              <h4>Acciones en vivo</h4>
              {acciones.length === 0 && <p>No hay acciones registradas.</p>}
              {acciones.map(a => (
                <div key={a.id} style={{ display:'flex', gap:'0.5rem', fontSize:'0.95rem' }}>
                  <span>[{a.minuto}']</span>
                  <span>{a.tipo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evaluación */}
      {activeTab === 'evaluacion' && (
        <div className="card">
          <h3>Evaluación por jugador</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'0.75rem' }}>
            {convocados.map(j => (
              <div key={j.id} style={{ display:'grid', gridTemplateColumns:'2fr repeat(4, 1fr)', gap:'0.5rem', alignItems:'center' }}>
                <div>#{j.numeroCamiseta} {j.nombre} {j.apellido}</div>
                {['tecnica','fisico','tactica','actitud'].map(campo => (
                  <input key={campo} type="number" min="1" max="10" placeholder={campo}
                    value={evaluaciones[j.id]?.[campo] ?? ''}
                    onChange={e=> setEvaluaciones(prev=> ({ ...prev, [j.id]: { ...prev[j.id], [campo]: Number(e.target.value) } }))}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop:'1rem' }}>
            <button onClick={guardarEvaluaciones}>Guardar Evaluaciones</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleEventoClub;
