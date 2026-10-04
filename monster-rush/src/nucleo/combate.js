/**
 * Motor de combate por turnos. No dibuja nada: cada acción devuelve una
 * lista de "pasos" que la interfaz va mostrando uno por uno:
 *
 *  { tipo: 'texto', texto }
 *  { tipo: 'ps', lado: 'jugador'|'rival', ps, psMax }
 *  { tipo: 'entra', lado }            ← cambió la criatura de ese lado
 *  { tipo: 'debilitada', lado }
 *  { tipo: 'bola', sacudidas, atrapada }
 *  { tipo: 'nivel' }                  ← tu criatura subió de nivel
 *  { tipo: 'fin', resultado: 'victoria'|'derrota'|'huida'|'captura' }
 */
import { ATAQUES } from '../datos/ataques.js';
import { OBJETOS } from '../datos/objetos.js';
import { ESPECIES } from '../datos/especies.js';
import { efectividad } from '../datos/tipos.js';
import { stats, nombre, debilitada, curar, expQueDa, ganarExp } from './criatura.js';

/** Ataque de emergencia cuando no quedan PP. */
const FORCEJEO = { nombre: 'Forcejeo', tipo: 'normal', poder: 30, precision: 100 };

/** Multiplicador por etapas de Gruñido/Malicioso (-6 a +6). */
const porEtapa = (e) => (e >= 0 ? (2 + e) / 2 : 2 / (2 - e));

/** Daño de un ataque (fórmula al estilo de los juegos clásicos). */
export function calcularDaño(atacante, defensor, ataque, modsA, modsD, azar = Math.random) {
  const sA = stats(atacante);
  const sD = stats(defensor);
  const atk = sA.ataque * porEtapa(modsA.ataque);
  const def = sD.defensa * porEtapa(modsD.defensa);
  const base = Math.floor((((2 * atacante.nivel) / 5 + 2) * ataque.poder * atk / def) / 50) + 2;
  const stab = ESPECIES[atacante.especie].tipos.includes(ataque.tipo) ? 1.5 : 1;
  const efecto = efectividad(ataque.tipo, ESPECIES[defensor.especie].tipos);
  const variacion = 0.85 + azar() * 0.15;
  return { daño: Math.max(1, Math.floor(base * stab * efecto * variacion)), efecto };
}

export function crearCombate({ equipo, rival, mochila, azar = Math.random }) {
  const entrenador = rival.entrenador || null;
  const lados = {
    jugador: { lista: equipo, i: equipo.findIndex((c) => !debilitada(c)), mods: { ataque: 0, defensa: 0 } },
    rival: { lista: rival.criaturas, i: 0, mods: { ataque: 0, defensa: 0 } },
  };
  let resultado = null;
  let capturada = null;

  const activa = (lado) => lados[lado].lista[lados[lado].i];
  const otro = (lado) => (lado === 'jugador' ? 'rival' : 'jugador');
  const etiqueta = (lado) => (lado === 'rival' && !entrenador ? `${nombre(activa(lado))} salvaje` : nombre(activa(lado)));

  function inicio() {
    const pasos = [];
    if (entrenador) {
      pasos.push({ tipo: 'texto', texto: `¡${entrenador.nombre} quiere pelear!` });
      pasos.push({ tipo: 'texto', texto: `${entrenador.nombre} envía a ${nombre(activa('rival'))}.` });
    } else {
      pasos.push({ tipo: 'texto', texto: `¡Un ${nombre(activa('rival'))} salvaje apareció!` });
    }
    pasos.push({ tipo: 'texto', texto: `¡Adelante, ${nombre(activa('jugador'))}!` });
    return pasos;
  }

  /** Un lado usa un ataque contra el otro. Devuelve true si el defensor se debilitó. */
  function usarAtaque(lado, indice, pasos) {
    const yo = activa(lado);
    const objetivoLado = otro(lado);
    const objetivo = activa(objetivoLado);
    const ranura = yo.ataques[indice];
    const ataque = ranura && ranura.pp > 0 ? ATAQUES[ranura.id] : FORCEJEO;
    if (ranura && ranura.pp > 0) ranura.pp -= 1;

    pasos.push({ tipo: 'texto', texto: `¡${etiqueta(lado)} usó ${ataque.nombre.toUpperCase()}!` });
    if (azar() * 100 >= ataque.precision) {
      pasos.push({ tipo: 'texto', texto: 'Pero falló.' });
      return false;
    }

    if (ataque.efecto === 'curaMitad') {
      const curado = curar(yo, Math.floor(stats(yo).psMax / 2));
      pasos.push({ tipo: 'ps', lado, ps: yo.ps, psMax: stats(yo).psMax });
      pasos.push({ tipo: 'texto', texto: curado > 0 ? `${etiqueta(lado)} recuperó vida.` : '¡Ya tenía la vida llena!' });
      return false;
    }
    if (ataque.efecto === 'bajaAtaque' || ataque.efecto === 'bajaDefensa') {
      const stat = ataque.efecto === 'bajaAtaque' ? 'ataque' : 'defensa';
      const mods = lados[objetivoLado].mods;
      if (mods[stat] <= -6) {
        pasos.push({ tipo: 'texto', texto: '¡No tuvo efecto!' });
      } else {
        mods[stat] -= 1;
        pasos.push({ tipo: 'texto', texto: `¡Bajó el ${stat.toUpperCase()} de ${etiqueta(objetivoLado)}!` });
      }
      return false;
    }

    const { daño, efecto } = calcularDaño(yo, objetivo, ataque, lados[lado].mods, lados[objetivoLado].mods, azar);
    objetivo.ps = Math.max(0, objetivo.ps - daño);
    pasos.push({ tipo: 'ps', lado: objetivoLado, ps: objetivo.ps, psMax: stats(objetivo).psMax });
    if (efecto > 1) pasos.push({ tipo: 'texto', texto: '¡Es muy eficaz!' });
    if (efecto < 1) pasos.push({ tipo: 'texto', texto: 'No es muy eficaz...' });

    if (debilitada(objetivo)) {
      pasos.push({ tipo: 'debilitada', lado: objetivoLado });
      pasos.push({ tipo: 'texto', texto: `¡${etiqueta(objetivoLado)} se debilitó!` });
      return true;
    }
    return false;
  }

  /** Qué pasa cuando alguien se debilita. */
  function despuesDeDebilitar(ladoDebilitado, pasos) {
    if (ladoDebilitado === 'rival') {
      const mia = activa('jugador');
      const exp = expQueDa(activa('rival'), Boolean(entrenador));
      pasos.push({ tipo: 'texto', texto: `${nombre(mia)} ganó ${exp} puntos de EXP.` });
      for (const s of ganarExp(mia, exp)) {
        if (s.tipo === 'nivel') {
          pasos.push({ tipo: 'nivel' });
          pasos.push({ tipo: 'texto', texto: `¡${nombre(mia)} subió al nivel ${s.nivel}!` });
        } else {
          if (s.olvida) pasos.push({ tipo: 'texto', texto: `${nombre(mia)} olvidó ${ATAQUES[s.olvida].nombre.toUpperCase()}...` });
          pasos.push({ tipo: 'texto', texto: `¡Y aprendió ${ATAQUES[s.ataque].nombre.toUpperCase()}!` });
        }
      }
      const siguiente = lados.rival.lista.findIndex((c) => !debilitada(c));
      if (siguiente >= 0) {
        lados.rival.i = siguiente;
        lados.rival.mods = { ataque: 0, defensa: 0 };
        pasos.push({ tipo: 'texto', texto: `${entrenador.nombre} envía a ${nombre(activa('rival'))}.` });
        pasos.push({ tipo: 'entra', lado: 'rival' });
      } else {
        if (entrenador) pasos.push({ tipo: 'texto', texto: `¡Ganaste! Recibes $${entrenador.dinero}.` });
        terminar('victoria', pasos);
      }
    } else {
      const siguiente = lados.jugador.lista.findIndex((c) => !debilitada(c));
      if (siguiente >= 0) {
        lados.jugador.i = siguiente;
        lados.jugador.mods = { ataque: 0, defensa: 0 };
        pasos.push({ tipo: 'texto', texto: `¡Adelante, ${nombre(activa('jugador'))}!` });
        pasos.push({ tipo: 'entra', lado: 'jugador' });
      } else {
        pasos.push({ tipo: 'texto', texto: '¡No te quedan criaturas! Corres al centro de curación...' });
        terminar('derrota', pasos);
      }
    }
  }

  function terminar(r, pasos) {
    resultado = r;
    pasos.push({ tipo: 'fin', resultado: r });
  }

  /** El rival ataca con un ataque al azar. Devuelve true si debilitó a tu criatura. */
  function ataqueRival(pasos) {
    const rivalC = activa('rival');
    const usables = rivalC.ataques.map((a, i) => (a.pp > 0 ? i : -1)).filter((i) => i >= 0);
    const indice = usables.length ? usables[Math.floor(azar() * usables.length)] : -1;
    if (!usarAtaque('rival', indice, pasos)) return false;
    despuesDeDebilitar('jugador', pasos);
    return true;
  }

  /** Tu criatura ataca. Devuelve true si debilitó al rival. */
  function ataqueJugador(indice, pasos) {
    if (!usarAtaque('jugador', indice, pasos)) return false;
    despuesDeDebilitar('rival', pasos);
    return true;
  }

  /** Intenta capturar con una bola. Devuelve true si la atrapó. */
  function lanzarBola(objeto, pasos) {
    const c = activa('rival');
    const max = stats(c).psMax;
    const tasa = ESPECIES[c.especie].captura;
    const prob = Math.min(1, ((3 * max - 2 * c.ps) * tasa * objeto.bono) / (3 * max * 255));
    pasos.push({ tipo: 'texto', texto: `¡Lanzaste una ${objeto.nombre.toUpperCase()}!` });
    if (azar() < prob) {
      pasos.push({ tipo: 'bola', sacudidas: 3, atrapada: true });
      pasos.push({ tipo: 'texto', texto: `¡Atrapaste a ${nombre(c)}!` });
      capturada = c;
      terminar('captura', pasos);
      return true;
    }
    const sacudidas = Math.floor(azar() * 3);
    pasos.push({ tipo: 'bola', sacudidas, atrapada: false });
    pasos.push({ tipo: 'texto', texto: ['¡Oh, no! Se escapó.', '¡Casi la atrapas!', '¡Uf! Faltó poco.'][sacudidas] });
    return false;
  }

  /**
   * El jugador elige una acción:
   *  { tipo: 'atacar', indice } · { tipo: 'objeto', id, objetivo? } · { tipo: 'cambiar', indice } · { tipo: 'huir' }
   */
  function turno(accion) {
    const pasos = [];
    if (resultado) return pasos;

    if (accion.tipo === 'atacar') {
      const vJ = stats(activa('jugador')).velocidad;
      const vR = stats(activa('rival')).velocidad;
      // El más rápido ataca primero; si debilita al otro, el otro pierde su turno
      const turnos = vJ >= vR
        ? [() => ataqueJugador(accion.indice, pasos), () => ataqueRival(pasos)]
        : [() => ataqueRival(pasos), () => ataqueJugador(accion.indice, pasos)];
      const debilito = turnos[0]();
      if (!debilito && !resultado) turnos[1]();
      return pasos;
    }

    if (accion.tipo === 'huir') {
      if (entrenador) {
        pasos.push({ tipo: 'texto', texto: '¡No puedes huir de un combate contra un entrenador!' });
        return pasos;
      }
      const vJ = stats(activa('jugador')).velocidad;
      const vR = stats(activa('rival')).velocidad;
      if (vJ >= vR || azar() < 0.5) {
        pasos.push({ tipo: 'texto', texto: '¡Escapaste sin problemas!' });
        terminar('huida', pasos);
        return pasos;
      }
      pasos.push({ tipo: 'texto', texto: '¡No pudiste escapar!' });
      ataqueRival(pasos);
      return pasos;
    }

    if (accion.tipo === 'cambiar') {
      lados.jugador.i = accion.indice;
      lados.jugador.mods = { ataque: 0, defensa: 0 };
      pasos.push({ tipo: 'texto', texto: `¡Adelante, ${nombre(activa('jugador'))}!` });
      pasos.push({ tipo: 'entra', lado: 'jugador' });
      ataqueRival(pasos);
      return pasos;
    }

    if (accion.tipo === 'objeto') {
      const objeto = OBJETOS[accion.id];
      if (!mochila[accion.id]) return pasos;
      if (objeto.usar === 'capturar') {
        if (entrenador) {
          pasos.push({ tipo: 'texto', texto: '¡No puedes atrapar la criatura de otro entrenador!' });
          return pasos;
        }
        mochila[accion.id] -= 1;
        if (!lanzarBola(objeto, pasos)) ataqueRival(pasos);
        return pasos;
      }
      if (objeto.usar === 'curar') {
        const c = lados.jugador.lista[accion.objetivo ?? lados.jugador.i];
        mochila[accion.id] -= 1;
        const curado = curar(c, objeto.cura);
        if (c === activa('jugador')) pasos.push({ tipo: 'ps', lado: 'jugador', ps: c.ps, psMax: stats(c).psMax });
        pasos.push({ tipo: 'texto', texto: `${nombre(c)} recuperó ${curado} PS.` });
        ataqueRival(pasos);
      }
    }
    return pasos;
  }

  return {
    inicio,
    turno,
    activa,
    get resultado() { return resultado; },
    get capturada() { return capturada; },
    get entrenador() { return entrenador; },
    indiceJugador: () => lados.jugador.i,
  };
}
