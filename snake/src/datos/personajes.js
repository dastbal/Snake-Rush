/**
 * Personajes. Cada uno trae su mundo completo:
 *  - cabeza: dibujo de 10×10 (null = cabeza clásica con ojos)
 *  - fondo: nombre de un fondo de src/graficos/fondos.js
 *  - poderes: qué poderes de src/datos/poderes.js pueden aparecer
 *  - niveles: nombre de cada nivel de su mundo
 *  - comida y muro: dibujos de 10×10
 *
 * Los dibujos son de 10×10 "pixeles": cada letra es un color de la paleta
 * y "." es transparente.
 *
 * Para agregar un personaje: copia una entrada, cambia los dibujos y listo.
 * El menú lo muestra solo.
 */

const HONGO = [
  '...RRRR...',
  '.RRWWRRRR.',
  'RRWWWWRRWR',
  'RRWWWWRRWR',
  'RRRWWRRRRR',
  'RWRRRRRWWR',
  '..SSSSSS..',
  '..SKSSKS..',
  '..SSSSSS..',
  '...SSSS...',
];
const CARA_MARIO = [
  '..RRRRRR..',
  '.RRRWWRRR.',
  'RRRRRRRRRR',
  'BBSSSKSSS.',
  'BSBSSKSSSS',
  'BSSSSSBSSS',
  'BBSSSBBBBB',
  '..SSSSSSS.',
  '..SSSSSS..',
  '...SSSS...',
];

// Cada personaje tiene: cabeza, comida, muro, fondo, poderes y nombres de nivel
export const PERSONAJES = {
  Clásica: {
    cabeza: null, // se dibuja con el color del cuerpo y dos ojos
    fondo: 'arcade',
    poderes: ['estrella', 'rayo', 'iman', 'reloj', 'doble'],
    niveles: ['Arcade', 'Esquinas', 'Pasillos'],
    comida: {
      paleta: { R: 0xe53935, D: 0x9e1b1b, G: 0x43a047, B: 0x6d4c41, W: 0xffcdd2 },
      dibujo: [
        '....B.....',
        '....BGG...',
        '..RRBRRR..',
        '.RRRRRRRR.',
        'RWWRRRRRRD',
        'RWRRRRRRRD',
        'RRRRRRRRRD',
        '.RRRRRRRD.',
        '.RRRRRRDD.',
        '..RR..DD..',
      ],
    },
    muro: {
      paleta: { G: 0x8a948f, L: 0xb8c2bd, D: 0x4c5450 },
      dibujo: [
        'LLLLLLLLLG',
        'LGGGGGGGGD',
        'LGGGGGGGGD',
        'LGGGGGGGGD',
        'LGGGGGGGGD',
        'LGGGGGGGGD',
        'LGGGGGGGGD',
        'LGGGGGGGGD',
        'LGGGGGGGGD',
        'GDDDDDDDDD',
      ],
    },
  },
  Pikachu: {
    cabeza: {
      paleta: { Y: 0xffd83a, K: 0x111111, W: 0xffffff, R: 0xe8402a },
      dibujo: [
        'K........K',
        'YK......KY',
        'YYYYYYYYYY',
        'YYYYYYYYYY',
        'YKWYYYYKWY',
        'YKKYYYYKKY',
        'RRYYYKYYRR',
        'RRYYYYYYRR',
        'YYYKKKKYYY',
        '.YYYYYYYY.',
      ],
    },
    fondo: 'bosque',
    poderes: ['rayo', 'reloj', 'doble'],
    niveles: ['Bosque Verde', 'Claro del Bosque', 'Bosque Profundo'],
    comida: {
      paleta: { B: 0x3d6fe0, D: 0x24459c, W: 0xa9c4ff, G: 0x43a047 },
      dibujo: [
        '....GG....',
        '...GGGG...',
        '..BBBBBB..',
        '.BWWBBBBB.',
        'BBWBBBBBBD',
        'BBBBBBBBBD',
        'BBBBBBBBBD',
        '.BBBBBBBD.',
        '..BBBBDD..',
        '....DD....',
      ],
    },
    muro: { // un árbol
      paleta: { G: 0x1b5e20, L: 0x2e7d32, T: 0x5d4037 },
      dibujo: [
        '...GGGG...',
        '..GGGGGG..',
        '.GGLGGGGG.',
        'GGGGGGLGGG',
        'GLGGGGGGGG',
        '.GGGGGLGG.',
        '..GGGGGG..',
        '....TT....',
        '....TT....',
        '...TTTT...',
      ],
    },
  },
  Mario: {
    cabeza: {
      paleta: { R: 0xe52521, W: 0xffffff, S: 0xf8b878, B: 0x6b3a1e, K: 0x111111 },
      dibujo: CARA_MARIO,
    },
    fondo: 'cielo',
    poderes: ['estrella', 'iman', 'doble'],
    niveles: ['Mundo 1-1', 'Mundo 1-2', 'Mundo 1-3'],
    comida: { paleta: { R: 0xe52521, W: 0xffffff, S: 0xf3d9a4, K: 0x111111 }, dibujo: HONGO },
    muro: { // un ladrillo
      paleta: { B: 0xc84c0c, M: 0x4a1f04, L: 0xf0a070 },
      dibujo: [
        'LLLLLMLLLL',
        'BBBBBMBBBB',
        'BBBBBMBBBB',
        'MMMMMMMMMM',
        'LLMLLLLLML',
        'BBMBBBBBMB',
        'BBMBBBBBMB',
        'MMMMMMMMMM',
        'LLLLLMLLLL',
        'BBBBBMBBBB',
      ],
    },
  },
  Luigi: {
    cabeza: {
      paleta: { R: 0x2fa83a, W: 0xffffff, S: 0xf8b878, B: 0x6b3a1e, K: 0x111111 },
      dibujo: CARA_MARIO,
    },
    fondo: 'subterraneo',
    poderes: ['estrella', 'reloj', 'iman'],
    niveles: ['Subterráneo 1', 'Subterráneo 2', 'Subterráneo 3'],
    comida: { paleta: { R: 0x2fa83a, W: 0xffffff, S: 0xf3d9a4, K: 0x111111 }, dibujo: HONGO },
    muro: { // una tubería
      paleta: { K: 0x0b3d12, G: 0x3fbf4a, L: 0xa8f0a0, D: 0x1f7a2a },
      dibujo: [
        'KKKKKKKKKK',
        'KLGGGGGGDK',
        'KLGGGGGGDK',
        'KKKKKKKKKK',
        '.KLGGGGDK.',
        '.KLGGGGDK.',
        '.KLGGGGDK.',
        '.KLGGGGDK.',
        '.KLGGGGDK.',
        '.KLGGGGDK.',
      ],
    },
  },
  Kirby: {
    cabeza: {
      paleta: { P: 0xffa6c9, K: 0x111111, B: 0x2a4bd0, R: 0xe0306a },
      dibujo: [
        '..PPPPPP..',
        '.PPPPPPPP.',
        'PPPKPPKPPP',
        'PPPKPPKPPP',
        'PPPBPPBPPP',
        'PRRPPPPRRP',
        'PPPPKKPPPP',
        '.PPPPPPPP.',
        'RRRPPPPRRR',
        '.RR....RR.',
      ],
    },
    fondo: 'dulce',
    poderes: ['iman', 'doble', 'reloj'],
    niveles: ['Tierra de Sueños', 'Nubes de Algodón', 'Castillo de Dulce'],
    comida: { // una fresa
      paleta: { R: 0xe8344e, W: 0xffe0a0, G: 0x43a047 },
      dibujo: [
        '...GGGG...',
        '....GG....',
        '..RRRRRR..',
        '.RRWRRRWR.',
        '.RRRRRRRR.',
        '.RWRRRWRR.',
        '..RRRRRR..',
        '..RRWRRR..',
        '...RRRR...',
        '....RR....',
      ],
    },
    muro: { // bloque estrella
      paleta: { K: 0x7a4b00, Y: 0xffd84d, O: 0xff9a1f },
      dibujo: [
        'KKKKKKKKKK',
        'KYYYYYYYYK',
        'KYYYOYYYYK',
        'KYYOOOYYYK',
        'KYOOOOOYYK',
        'KYYOOOYYYK',
        'KYYOYOYYYK',
        'KYYYYYYYYK',
        'KYYYYYYYYK',
        'KKKKKKKKKK',
      ],
    },
  },
  Sonic: {
    cabeza: {
      paleta: { B: 0x1e5bd8, W: 0xffffff, G: 0x2aa84a, S: 0xf5c99b, K: 0x111111 },
      dibujo: [
        '..BBBBB...',
        '.BBBBBBBB.',
        'BBBBWWWWB.',
        'BBBWWGWGW.',
        'BBBWWGWGW.',
        'BBBSSSSSSK',
        '.BBSSSSSS.',
        'BBBBSKKSS.',
        '.BBBBSSS..',
        'B..BBBB...',
      ],
    },
    fondo: 'greenhill',
    poderes: ['estrella', 'doble', 'reloj'],
    niveles: ['Green Hill 1', 'Green Hill 2', 'Green Hill 3'],
    comida: { // un anillo
      paleta: { Y: 0xffe14d, O: 0xd9a400 },
      dibujo: [
        '...YYYY...',
        '..YOOOOY..',
        '.YO....OY.',
        'YO......OY',
        'YO......OY',
        'YO......OY',
        'YO......OY',
        '.YO....OY.',
        '..YOOOOY..',
        '...YYYY...',
      ],
    },
    muro: { // púas
      paleta: { S: 0x9aa3ad, W: 0xffffff, K: 0x444b52 },
      dibujo: [
        '....S.....',
        '...SWS....',
        '...SWS....',
        '..SSWSS...',
        '..SSWSS...',
        '.SSSWSSS..',
        '.SSSWSSS..',
        'SSSSWSSSS.',
        'KKKKKKKKKK',
        'KKKKKKKKKK',
      ],
    },
  },
};
