/**
 * Fondos de cada mundo. Cada fondo es una función que pinta con el
 * "lápiz" (Graphics de Phaser). Para agregar un fondo, agrega una función
 * y úsala por su nombre en src/datos/personajes.js.
 */
import { CASILLA, COLUMNAS, FILAS, ANCHO, ALTO } from '../config/ajustes.js';

/** Tablero a cuadros de dos colores. */
function cuadros(g, a, b) {
  for (let x = 0; x < COLUMNAS; x++) {
    for (let y = 0; y < FILAS; y++) {
      g.fillStyle((x + y) % 2 === 0 ? a : b);
      g.fillRect(x * CASILLA, y * CASILLA, CASILLA, CASILLA);
    }
  }
}

export const FONDOS = {
  arcade(g) {
    g.fillStyle(0x000000);
    g.fillRect(0, 0, ANCHO, ALTO);
    g.lineStyle(1, 0x1c2a22);
    for (let i = 0; i <= COLUMNAS; i++) g.lineBetween(i * CASILLA, 0, i * CASILLA, ALTO);
    for (let j = 0; j <= FILAS; j++) g.lineBetween(0, j * CASILLA, ANCHO, j * CASILLA);
  },

  bosque(g) {
    cuadros(g, 0x7cc34a, 0x6fb33f);
  },

  cielo(g) {
    g.fillStyle(0x5c94fc);
    g.fillRect(0, 0, ANCHO, ALTO);
    g.fillStyle(0xffffff, 0.85);
    for (const [nx, ny] of [[60, 50], [250, 110], [130, 250], [320, 320]]) {
      g.fillRect(nx, ny, 50, 12);
      g.fillRect(nx + 10, ny - 8, 28, 10);
    }
  },

  subterraneo(g) {
    g.fillStyle(0x10162f);
    g.fillRect(0, 0, ANCHO, ALTO);
    g.lineStyle(1, 0x22305e);
    for (let y = 0; y <= FILAS; y++) {
      g.lineBetween(0, y * CASILLA, ANCHO, y * CASILLA);
      const corrido = y % 2 === 0 ? 0 : CASILLA / 2;
      for (let x = 0; x <= COLUMNAS; x++) {
        g.lineBetween(x * CASILLA + corrido, y * CASILLA, x * CASILLA + corrido, (y + 1) * CASILLA);
      }
    }
  },

  dulce(g) {
    cuadros(g, 0xffe3ef, 0xffd3e6);
  },

  greenhill(g) {
    cuadros(g, 0xd28a3a, 0xb5702a);
  },
};
