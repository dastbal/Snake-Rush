/**
 * Mapas del mundo. Cada letra es una loseta de src/datos/sprites.js.
 *
 * Cada mapa tiene:
 *  - losetas: filas de texto (todas del mismo largo)
 *  - musica: nombre de una melodía de src/audio/sonido.js
 *  - salidas: { x, y, a: 'otroMapa', ax, ay, requiere? } al pisar la casilla
 *  - puertas: { x, y, accion } al entrar por una puerta (ver interfaz/acciones.js)
 *  - letreros: { x, y, texto }
 *  - personas: aldeanos y entrenadores
 *  - encuentros: criaturas del pasto alto { especie, min, max, peso }
 *
 * Para agregar un mapa nuevo: crea una entrada y conéctala con `salidas`.
 */
export const MAPAS = {
  pueblo: {
    nombre: 'PUEBLO ALBA',
    musica: 'pueblo',
    losetas: [
      'TTTTTTTTT,,TTTTTTTTT',
      'T........,,........T',
      'T.RRRR...,,..BBBBB.T',
      'T.RRRR...,,..BBBBB.T',
      'T.WVDW...,,..WVWDW.T',
      'T....,...,,.....,..T',
      'T....,,,,,,,,,,,,..T',
      'T.f.....S,,........T',
      'T.......,,,........T',
      'T.PPPP..,,..MMMM...T',
      'T.PPPP..,,..MMMM...T',
      'T.WDVW..,,..WVDW...T',
      'T..,,,,,,,,,,,,....T',
      'T.ff.....,,....ff..T',
      'T~~~~....,,....FFFFT',
      'T~~~~..........f...T',
      'T~~~~..........ff..T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    salidas: [
      { x: 9, y: 0, a: 'ruta1', ax: 9, ay: 28, requiere: 'inicial' },
      { x: 10, y: 0, a: 'ruta1', ax: 10, ay: 28, requiere: 'inicial' },
    ],
    puertas: [
      { x: 4, y: 4, accion: 'casa' },
      { x: 16, y: 4, accion: 'laboratorio' },
      { x: 3, y: 11, accion: 'centro' },
      { x: 14, y: 11, accion: 'tienda' },
    ],
    letreros: [
      { x: 8, y: 7, texto: 'PUEBLO ALBA\nDonde empiezan las aventuras.' },
    ],
    personas: [
      { id: 'vecina', sprite: 'aldeano', x: 12, y: 7, dialogo: ['¡En el pasto alto salen criaturas salvajes!', 'Debilítalas y lánzales una MONSTER BALL.'] },
      { id: 'abuelo', sprite: 'profesor', x: 6, y: 13, dialogo: ['El FUEGO gana a la PLANTA, la PLANTA al AGUA y el AGUA al FUEGO.', '¡Y lo ELÉCTRICO es muy bueno contra los VOLADORES!'] },
    ],
    encuentros: [],
    inicio: { x: 4, y: 5 },
  },

  ruta1: {
    nombre: 'RUTA 1',
    musica: 'ruta',
    losetas: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T........,,........T',
      'T.......,,,,.......T',
      'T.ff....,,,,....ff.T',
      'T....hhh,,,,hhh....T',
      'T...hhhh,,,,hhhh...T',
      'T...hhhh,,,,hhhh...T',
      'T.......,,,,.......T',
      'TTTTT...,,,,...TTTTT',
      'T.hhhh..,,,,.......T',
      'T.hhhh..,,,,..hhhh.T',
      'T.hhhh..,,,,..hhhh.T',
      'T.......,,,,..hhhh.T',
      'T..S....,,,,.......T',
      'T.......,,,,...TTTTT',
      'TTTT....,,,,.......T',
      'T.hhhhhh,,,,hhhhhh.T',
      'T.hhhhhh,,,,hhhhhh.T',
      'T.hhhhhh,,,,hhhhhh.T',
      'T.......,,,,.......T',
      'T..ff...,,,,...~~~~T',
      'T.......,,,,...~~~~T',
      'T...hhhh,,,,.......T',
      'T...hhhh,,,,..f....T',
      'T.......,,,,.......T',
      'TTTTTTT.,,,,.TTTTTTT',
      'T.......,,,,.......T',
      'T..ff...,,,,...ff..T',
      'T.......,,,,.......T',
      'TTTTTTTTT,,TTTTTTTTT',
    ],
    salidas: [
      { x: 9, y: 29, a: 'pueblo', ax: 9, ay: 1 },
      { x: 10, y: 29, a: 'pueblo', ax: 10, ay: 1 },
    ],
    puertas: [],
    letreros: [
      { x: 3, y: 13, texto: 'RUTA 1\n↑ La LÍDER VOLTA te espera al norte.' },
    ],
    personas: [
      {
        id: 'tito', sprite: 'nino', x: 12, y: 19,
        dialogo: ['¡Oye! ¡Tú tienes una criatura! ¡Peleemos!'],
        entrenador: { nombre: 'NIÑO TITO', equipo: [['ratin', 4], ['pipio', 5]], dinero: 120, derrota: ['¡Ganaste! Mis criaturas necesitan descansar.'] },
      },
      {
        id: 'lider', sprite: 'lider', x: 9, y: 1,
        dialogo: ['Soy VOLTA, la LÍDER de esta región.', '¿Crees que puedes contra mis criaturas? ¡Veamos!'],
        entrenador: {
          nombre: 'LÍDER VOLTA', lider: true, equipo: [['pipio', 8], ['chispon', 10]], dinero: 800,
          derrota: ['¡Increíble! Te ganaste la MEDALLA TRUENO.', 'Tu aventura apenas empieza... ¡Continuará!'],
        },
      },
    ],
    encuentros: [
      { especie: 'ratin', min: 2, max: 5, peso: 30 },
      { especie: 'pipio', min: 2, max: 5, peso: 30 },
      { especie: 'hojita', min: 3, max: 5, peso: 15 },
      { especie: 'burbu', min: 3, max: 6, peso: 10 },
      { especie: 'ascuin', min: 3, max: 6, peso: 8 },
      { especie: 'chispon', min: 4, max: 6, peso: 7 },
    ],
  },
};

/** Probabilidad de encontrar una criatura en cada paso por pasto alto. */
export const PROB_ENCUENTRO = 0.12;

/** Dónde empieza una partida nueva y dónde reapareces si pierdes. */
export const INICIO = { mapa: 'pueblo', x: 4, y: 5 };
export const REAPARECER = { mapa: 'pueblo', x: 3, y: 12 };
