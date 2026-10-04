/**
 * El estado del juego: todo lo que "existe" en este momento.
 * Es un solo objeto para que cualquier módulo lo pueda leer.
 */
import { PERSONAJES } from '../datos/personajes.js';

export const estado = {
  /** Lo que escogió el jugador en el menú. */
  eleccion: { color: 'Verde', personaje: 'Clásica', dificultad: 'Normal' },

  /** 'menu' | 'jugando' | 'pausa' | 'fin' */
  modo: 'menu',

  serpiente: [{ x: 11, y: 14 }, { x: 10, y: 14 }, { x: 9, y: 14 }, { x: 8, y: 14 }, { x: 7, y: 14 }],
  direccion: { x: 1, y: 0 },
  /** Giro pedido por el jugador; se aplica en el próximo paso. */
  siguiente: { x: 1, y: 0 },
  comida: { x: 14, y: 14 },
  muros: [],
  /** Poder en el tablero: { x, y, tipo, hasta } o null. */
  poder: null,
  /** Poderes activos: { estrella: hastaMs, ... } */
  efectos: {},
  puntos: 0,
  /** Nivel actual: 0, 1, 2 (se muestra como 1, 2, 3). */
  nivel: 0,
  /** Pausa corta al empezar o cambiar de nivel (ms). */
  esperaHasta: 0,
  /** La serpiente explotó y no se dibuja. */
  explotada: false,
};

/** El personaje (y su mundo) que escogió el jugador. */
export const personaje = () => PERSONAJES[estado.eleccion.personaje];

/** ¿Este poder está activo ahora? */
export const activo = (tipo, ahora) => (estado.efectos[tipo] || 0) > ahora;
