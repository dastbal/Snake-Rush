/**
 * Preguntas sobre el mapa: ¿se puede caminar aquí? ¿qué hay en esa casilla?
 * ¿cuál es el camino más corto? ¿aparece una criatura salvaje?
 */
import { MAPAS, PROB_ENCUENTRO } from '../datos/mapas.js';
import { LOSETAS } from '../datos/sprites.js';
import { crearCriatura } from './criatura.js';

export const DIRS = {
  arriba: { x: 0, y: -1 },
  abajo: { x: 0, y: 1 },
  izquierda: { x: -1, y: 0 },
  derecha: { x: 1, y: 0 },
};

export const mapa = (id) => MAPAS[id];
export const ancho = (m) => m.losetas[0].length;
export const alto = (m) => m.losetas.length;

export function loseta(m, x, y) {
  if (y < 0 || y >= alto(m) || x < 0 || x >= ancho(m)) return null;
  return LOSETAS[m.losetas[y][x]] || null;
}

/** ¿Hay una persona en esa casilla? */
export const personaEn = (m, x, y) => m.personas.find((p) => p.x === x && p.y === y) || null;
export const letreroEn = (m, x, y) => m.letreros.find((l) => l.x === x && l.y === y) || null;
export const puertaEn = (m, x, y) => m.puertas.find((p) => p.x === x && p.y === y) || null;
export const salidaEn = (m, x, y) => m.salidas.find((s) => s.x === x && s.y === y) || null;

export function caminable(m, x, y) {
  const l = loseta(m, x, y);
  return Boolean(l) && !l.solido && !personaEn(m, x, y);
}

/** ¿Hay algo con qué hablar en esa casilla? */
export const interactuable = (m, x, y) => Boolean(personaEn(m, x, y) || letreroEn(m, x, y));

/** Cada giro "cuesta" un poco, para preferir caminos rectos entre los más cortos. */
const COSTO_PASO = 10;
const COSTO_GIRO = 1;

/**
 * Camino más corto de (x0,y0) a (x1,y1) que, entre los igual de cortos,
 * gira lo menos posible (se ve natural, sin zigzag).
 * Es Dijkstra sobre (casilla, dirección): como un GPS que prefiere ir derecho.
 * Devuelve la lista de casillas sin incluir el inicio, o null si no hay camino.
 */
export function buscarCamino(m, x0, y0, x1, y1, dirInicial = null) {
  if (!caminable(m, x1, y1)) return null;
  const nombres = Object.keys(DIRS);
  const clave = (x, y, d) => `${x},${y},${d}`;
  const inicio = clave(x0, y0, dirInicial);
  const costo = new Map([[inicio, 0]]);
  const vino = new Map([[inicio, null]]);
  const abiertos = [{ x: x0, y: y0, d: dirInicial, c: 0 }];

  while (abiertos.length) {
    // Sacar el más barato (el mapa es chico: ordenar alcanza)
    abiertos.sort((a, b) => a.c - b.c);
    const actual = abiertos.shift();
    const k = clave(actual.x, actual.y, actual.d);
    if (actual.c > costo.get(k)) continue;
    if (actual.x === x1 && actual.y === y1) {
      const camino = [];
      for (let p = k; vino.get(p) !== null; p = vino.get(p)) {
        const [cx, cy] = p.split(',');
        camino.unshift({ x: Number(cx), y: Number(cy) });
      }
      return camino;
    }
    for (const n of nombres) {
      const nx = actual.x + DIRS[n].x;
      const ny = actual.y + DIRS[n].y;
      if (!caminable(m, nx, ny)) continue;
      const c = actual.c + COSTO_PASO + (actual.d && actual.d !== n ? COSTO_GIRO : 0);
      const kn = clave(nx, ny, n);
      if (costo.has(kn) && costo.get(kn) <= c) continue;
      costo.set(kn, c);
      vino.set(kn, k);
      abiertos.push({ x: nx, y: ny, d: n, c });
    }
  }
  return null;
}

/** Casilla vecina caminable más cercana a una persona o letrero (para ir a hablarle). */
export function vecinaParaHablar(m, desdeX, desdeY, x, y) {
  let mejor = null;
  for (const [nombreDir, d] of Object.entries(DIRS)) {
    const vx = x - d.x;
    const vy = y - d.y;
    const yaEstoy = vx === desdeX && vy === desdeY;
    const camino = yaEstoy ? [] : buscarCamino(m, desdeX, desdeY, vx, vy);
    if (camino && (!mejor || camino.length < mejor.camino.length)) mejor = { camino, mirar: nombreDir };
  }
  return mejor;
}

/** Tira los dados en pasto alto. Devuelve una criatura salvaje o null. */
export function tirarEncuentro(m, azar = Math.random) {
  if (!m.encuentros.length || azar() >= PROB_ENCUENTRO) return null;
  const total = m.encuentros.reduce((s, e) => s + e.peso, 0);
  let tiro = azar() * total;
  for (const e of m.encuentros) {
    tiro -= e.peso;
    if (tiro < 0) {
      const nivel = e.min + Math.floor(azar() * (e.max - e.min + 1));
      return crearCriatura(e.especie, nivel);
    }
  }
  return null;
}
