/**
 * Ajustes generales del juego. Cambiar un número aquí cambia todo el juego.
 */

/** Tamaño de cada casilla en píxeles y del tablero en casillas. */
export const CASILLA = 20;
export const COLUMNAS = 20;
export const FILAS = 20;
export const ANCHO = COLUMNAS * CASILLA;
export const ALTO = FILAS * CASILLA;

/** Cada cuántos puntos subes de nivel. */
export const PUNTOS_POR_NIVEL = 10;

/** Cada cuántos puntos aparece un muro nuevo y un poder. */
export const PUNTOS_POR_MURO = 3;
export const PUNTOS_POR_PODER = 5;

/** Cuánto dura un poder en el tablero antes de desaparecer (ms). */
export const VIDA_PODER = 10000;

/** Milisegundos entre cada paso: menos = más rápido. */
export const DIFICULTADES = { Fácil: 210, Normal: 150, Difícil: 95 };

/** Colores que el jugador puede escoger para el cuerpo. */
export const COLORES = {
  Verde: 0x3ecf5c,
  Azul: 0x3a8ef0,
  Morado: 0x9b5cf0,
  Naranja: 0xf08a24,
  Rosa: 0xf05ca8,
};
