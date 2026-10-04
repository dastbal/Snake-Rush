/**
 * Poderes. Cada poder es un objeto con su dibujo y su comportamiento.
 *
 * Campos opcionales que entiende el motor (src/nucleo/reglas.js):
 *  - duracion: ms que dura activo (0 = efecto instantáneo)
 *  - invencible: atraviesas muros y no te muerdes
 *  - multiplicaPuntos: cada comida vale más
 *  - multiplicaEspera: >1 hace el juego más lento
 *  - alAgarrar(estado, eventos): efecto instantáneo al tomarlo
 *  - cadaPaso(estado): se ejecuta en cada paso mientras está activo
 *
 * Para agregar un poder: crea una entrada nueva aquí y ponlo en la lista
 * `poderes` de algún personaje en src/datos/personajes.js.
 */
import { misma, ocupadaPorSerpiente, esMuro } from '../nucleo/tablero.js';

export const PODERES = {
  estrella: {
    icono: '⭐',
    nombre: 'Estrella',
    duracion: 6000,
    invencible: true,
    paleta: { Y: 0xffd700, K: 0x111111 },
    dibujo: [
      '....YY....',
      '....YY....',
      '...YYYY...',
      'YYYYYYYYYY',
      '.YYKYYKYY.',
      '..YKYYKY..',
      '..YYYYYY..',
      '.YYYYYYYY.',
      '.YYY..YYY.',
      'YY......YY',
    ],
  },

  rayo: {
    icono: '⚡',
    nombre: 'Rayo',
    duracion: 0,
    paleta: { Y: 0xffeb3b, O: 0xff9800 },
    dibujo: [
      '.....YYYY.',
      '....YYYO..',
      '...YYYO...',
      '..YYYO....',
      '.YYYYYYYY.',
      '....YYYO..',
      '...YYYO...',
      '..YYO.....',
      '.YO.......',
      'O.........',
    ],
    /** Destruye los muros a 5 casillas o menos de la cabeza. */
    alAgarrar(estado, eventos) {
      const h = estado.serpiente[0];
      estado.muros = estado.muros.filter((m) => Math.abs(m.x - h.x) + Math.abs(m.y - h.y) > 5);
      eventos.emitir('destello');
    },
  },

  iman: {
    icono: '🧲',
    nombre: 'Imán',
    duracion: 7000,
    paleta: { R: 0xe53935, W: 0xd0d6dc },
    dibujo: [
      '.WW....WW.',
      '.WW....WW.',
      '.RR....RR.',
      '.RR....RR.',
      '.RR....RR.',
      '.RRR..RRR.',
      '..RRRRRR..',
      '...RRRR...',
      '..........',
      '..........',
    ],
    /** La comida se acerca una casilla hacia la cabeza. */
    cadaPaso(estado) {
      const h = estado.serpiente[0];
      const c = estado.comida;
      if (Math.abs(h.x - c.x) + Math.abs(h.y - c.y) <= 1) return;
      const libre = (p) => !ocupadaPorSerpiente(estado, p) && !esMuro(estado, p) &&
        !(estado.poder && misma(estado.poder, p));
      const dx = Math.sign(h.x - c.x);
      const dy = Math.sign(h.y - c.y);
      const pasoX = { x: c.x + dx, y: c.y };
      const pasoY = { x: c.x, y: c.y + dy };
      if (dx !== 0 && libre(pasoX)) estado.comida = pasoX;
      else if (dy !== 0 && libre(pasoY)) estado.comida = pasoY;
    },
  },

  reloj: {
    icono: '⏱️',
    nombre: 'Reloj lento',
    duracion: 6000,
    multiplicaEspera: 1.8,
    paleta: { K: 0x222222, W: 0xf4f4f4 },
    dibujo: [
      '...KKKK...',
      '..KWWWWK..',
      '.KWWKWWWK.',
      'KWWWKWWWWK',
      'KWWWKWWWWK',
      'KWWWKKKWWK',
      'KWWWWWWWWK',
      '.KWWWWWWK.',
      '..KWWWWK..',
      '...KKKK...',
    ],
  },

  doble: {
    icono: '✖️2',
    nombre: 'Doble puntos',
    duracion: 8000,
    multiplicaPuntos: 2,
    paleta: { O: 0x8e44ad, W: 0xffffff },
    dibujo: [
      '.OOOOOOOO.',
      'OOOOOOOOOO',
      'OWOOOWWWOO',
      'OOWOWOOOWO',
      'OOOWOOOWOO',
      'OOWOWOWOOO',
      'OWOOOWWWWO',
      'OOOOOOOOOO',
      '.OOOOOOOO.',
      '..........',
    ],
  },
};
