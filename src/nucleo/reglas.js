/**
 * Las reglas del juego. No sabe nada de Phaser, sonidos ni pantallas:
 * solo cambia el estado y grita eventos.
 */
import {
  DIFICULTADES, PUNTOS_POR_NIVEL, PUNTOS_POR_MURO, PUNTOS_POR_PODER, VIDA_PODER,
} from '../config/ajustes.js';
import { NIVELES } from '../datos/niveles.js';
import { PODERES } from '../datos/poderes.js';
import { estado, personaje, activo } from './estado.js';
import { misma, fueraDelTablero, casillaLibre } from './tablero.js';

export const DIRECCIONES = {
  arriba: { x: 0, y: -1 },
  abajo: { x: 0, y: 1 },
  izquierda: { x: -1, y: 0 },
  derecha: { x: 1, y: 0 },
};

/** Lista de los poderes activos ahora. */
const poderesActivos = (ahora) =>
  Object.keys(estado.efectos).filter((tipo) => activo(tipo, ahora)).map((tipo) => PODERES[tipo]);

/** Multiplica un campo numérico de todos los poderes activos (ej. multiplicaPuntos). */
const multiplicador = (campo, ahora) =>
  poderesActivos(ahora).reduce((total, p) => total * (p[campo] || 1), 1);

export const esInvencible = (ahora) => poderesActivos(ahora).some((p) => p.invencible);

/** Milisegundos entre pasos: dificultad × nivel × poderes. */
export function espera(ahora) {
  const base = DIFICULTADES[estado.eleccion.dificultad];
  return base * NIVELES[estado.nivel].velocidad * multiplicador('multiplicaEspera', ahora);
}

export function crearReglas(eventos) {
  /** Prepara el tablero de un nivel: serpiente corta y mapa nuevo. */
  function ponerNivel(n) {
    estado.nivel = n;
    estado.serpiente = [{ x: 4, y: 10 }, { x: 3, y: 10 }, { x: 2, y: 10 }];
    estado.direccion = { x: 1, y: 0 };
    estado.siguiente = { x: 1, y: 0 };
    estado.muros = NIVELES[n].mapa();
    estado.poder = null;
    estado.comida = { x: -1, y: -1 };
    estado.comida = casillaLibre(estado, 3);
  }

  function empezar(ahora) {
    estado.efectos = {};
    estado.puntos = 0;
    estado.explotada = false;
    ponerNivel(0);
    estado.modo = 'jugando';
    estado.esperaHasta = ahora + 1000;
    eventos.emitir('inicio', { nombreNivel: personaje().niveles[0] });
  }

  /** El jugador pide girar. No se permite dar media vuelta. */
  function girar(nombre) {
    if (estado.modo !== 'jugando') return;
    const d = DIRECCIONES[nombre];
    if (d.x === -estado.direccion.x && d.y === -estado.direccion.y) return;
    estado.siguiente = d;
  }

  function perder() {
    estado.modo = 'fin';
    estado.explotada = true;
    eventos.emitir('perdio', { puntos: estado.puntos, nivel: estado.nivel });
  }

  function comer(ahora) {
    const gana = multiplicador('multiplicaPuntos', ahora);
    estado.puntos += gana;
    const colorComida = Object.values(personaje().comida.paleta)[0];
    eventos.emitir('comio', { casilla: estado.comida, color: colorComida, gana });

    // ¿Subió de nivel?
    const nivelNuevo = Math.min(NIVELES.length - 1, Math.floor(estado.puntos / PUNTOS_POR_NIVEL));
    if (nivelNuevo > estado.nivel) {
      ponerNivel(nivelNuevo);
      estado.esperaHasta = ahora + 1200;
      eventos.emitir('nivel', { nivel: nivelNuevo, nombreNivel: personaje().niveles[nivelNuevo] });
      return;
    }

    if (estado.puntos % PUNTOS_POR_MURO === 0) {
      const m = casillaLibre(estado, 4);
      if (m) estado.muros.push(m);
    }
    if (estado.puntos % PUNTOS_POR_PODER === 0 && !estado.poder) {
      const opciones = personaje().poderes;
      const c = casillaLibre(estado, 3);
      const tipo = opciones[Math.floor(Math.random() * opciones.length)];
      if (c) estado.poder = { ...c, tipo, hasta: ahora + VIDA_PODER };
    }
    estado.comida = casillaLibre(estado, 0) || estado.comida;
  }

  function agarrarPoder(ahora) {
    const p = PODERES[estado.poder.tipo];
    if (p.alAgarrar) p.alAgarrar(estado, eventos);
    if (p.duracion) estado.efectos[estado.poder.tipo] = ahora + p.duracion;
    eventos.emitir('poder', { casilla: estado.poder, poder: p });
    estado.poder = null;
  }

  /** Un paso: la serpiente avanza una casilla y se aplican las reglas. */
  function paso(ahora) {
    estado.direccion = estado.siguiente;
    const cabeza = estado.serpiente[0];
    const nueva = { x: cabeza.x + estado.direccion.x, y: cabeza.y + estado.direccion.y };
    const invencible = esInvencible(ahora);
    const vaAComer = misma(nueva, estado.comida);

    // Choques
    const cuerpo = vaAComer ? estado.serpiente : estado.serpiente.slice(0, -1);
    const seMuerde = !invencible && cuerpo.some((p) => misma(p, nueva));
    const muroIndice = estado.muros.findIndex((m) => misma(m, nueva));
    if (muroIndice >= 0 && invencible) {
      estado.muros.splice(muroIndice, 1);
      eventos.emitir('rompio', { casilla: nueva });
    }
    const chocaMuro = muroIndice >= 0 && !invencible;
    if (fueraDelTablero(nueva) || seMuerde || chocaMuro) {
      perder();
      return;
    }

    // Moverse: cabeza nueva adelante; si no come, se quita la cola
    estado.serpiente.unshift(nueva);
    if (vaAComer) {
      const nivelAntes = estado.nivel;
      comer(ahora);
      if (estado.nivel !== nivelAntes) return; // el tablero cambió completo
    } else {
      estado.serpiente.pop();
    }

    if (estado.poder && misma(nueva, estado.poder)) agarrarPoder(ahora);
    if (estado.poder && ahora > estado.poder.hasta) estado.poder = null;

    for (const p of poderesActivos(ahora)) {
      if (p.cadaPaso) p.cadaPaso(estado);
    }
  }

  return { empezar, girar, paso };
}
