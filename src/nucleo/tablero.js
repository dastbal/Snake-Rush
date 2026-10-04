/**
 * Ayudantes para trabajar con casillas del tablero.
 * Son funciones puras: reciben el estado y no cambian nada.
 */
import { COLUMNAS, FILAS } from '../config/ajustes.js';

/** ¿Son la misma casilla? */
export const misma = (a, b) => a.x === b.x && a.y === b.y;

/** ¿La casilla está fuera del tablero? */
export const fueraDelTablero = (c) => c.x < 0 || c.x >= COLUMNAS || c.y < 0 || c.y >= FILAS;

export const ocupadaPorSerpiente = (estado, c) => estado.serpiente.some((p) => misma(p, c));
export const esMuro = (estado, c) => estado.muros.some((m) => misma(m, c));

/** ¿Hay algo en la casilla? (serpiente, muro, comida o poder) */
export function ocupada(estado, c) {
  return ocupadaPorSerpiente(estado, c) || esMuro(estado, c) ||
    misma(estado.comida, c) || Boolean(estado.poder && misma(estado.poder, c));
}

/**
 * Busca una casilla libre al azar, a cierta distancia mínima de la cabeza.
 * Devuelve null si no encuentra (tablero casi lleno).
 */
export function casillaLibre(estado, distanciaMinima = 0) {
  const cabeza = estado.serpiente[0];
  for (let intento = 0; intento < 500; intento++) {
    const c = { x: Math.floor(Math.random() * COLUMNAS), y: Math.floor(Math.random() * FILAS) };
    const distancia = Math.abs(c.x - cabeza.x) + Math.abs(c.y - cabeza.y);
    if (!ocupada(estado, c) && distancia >= distanciaMinima) return c;
  }
  return null;
}
