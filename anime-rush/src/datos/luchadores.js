/**
 * Luchadores de Anime Rush: 32 personajes de 8 animes, 4 por serie.
 * Juego de fans, no oficial y sin fines de lucro (ver ADR 0011): los personajes
 * pertenecen a sus dueños; los dibujos son pixel art propio, hecho con letras.
 *
 * Arte de 32×51 píxeles, armado con piezas para no dibujar 32 figuras desde cero:
 *  - pelo: uno de PELOS (12 filas) · cara: una de CARAS (9 filas) · cuerpo común (30 filas)
 *  - colores: H pelo, S piel, E ojos, A ropa arriba, C centro/cinturón, D muñecas y tobillos,
 *    P pantalón, F zapatos (+ extras como M, W, R, Y, G, N)
 *  - Sombras automáticas: cada letra en minúscula es la versión oscura de su mayúscula
 *    (s = piel en sombra, a = ropa en sombra…), así cada dibujo tiene volumen.
 *  - especial: uno de los 4 tipos del motor (proyectil, clon, estirar, embestida)
 *
 * Para agregar un luchador: agrega una línea con `luchador({...})` en su serie.
 */

const K = 0x181820;
const PIEL = 0xf8c898;
export const ANCHO_ARTE = 32;
export const ALTO_ARTE = 51;

/** Rellena filas a 32 columnas y completa arriba con filas vacías hasta `alto`. */
function bloque(filas, alto) {
  const llenas = filas.map((f) => f.padEnd(ANCHO_ARTE, '.').slice(0, ANCHO_ARTE));
  while (llenas.length < alto) llenas.unshift('.'.repeat(ANCHO_ARTE));
  return llenas.slice(-alto);
}

// ---------- Peinados (12 filas) ----------
const PELOS = {
  puntas: [
    '..............K.....K',
    '.........K...KHK...KHK',
    '........KHK.KHHHK.KHHK...K',
    '.....K..KHHKHHHHHKHHHK..KHK',
    '....KHK.KHHHHHHHHHHHHHKKHHK',
    '...KHHHKHHHHHHHHHHHHHHHHHHK',
    '....KHHHHHHHHHHHHHHHHHHHHK',
    '..KKHHHHHHHHHHHHHHHHHHHHHK',
    '.KHHHHHHHhHHHHHHHHHHHHHHHK',
    '..KKHHHHhHHHHHHhHHHHHHHK',
    '....KHHhHHHKHHHHKHHHHHK',
    '.....KHHKHKSSSHKSSSSHHK',
  ],
  llama: [
    '...............KK',
    '..............KHHK',
    '.............KHHHHK',
    '............KHHHHHHK',
    '...........KHHHhHHHHK',
    '..........KHHHhHHHHHHK',
    '.........KHHHhHHHHHHHHK',
    '........KHHHhHHHHHHHHHK',
    '........KHHhHHHHHHHHHHHK',
    '.........KHHHHHHHHHHHHHK',
    '.........KHHKSSSSSSKHHK',
    '.........KHKSSSSSSSSKHK',
  ],
  corto: [
    '',
    '',
    '',
    '............KKKKKK',
    '..........KKHHHHHHKK',
    '.........KHHHHHHHHHHK',
    '........KHHHHHHHHHHHHK',
    '........KHHHhHHHHHhHHHK',
    '.......KHHHHHHHHHHHHHHK',
    '........KHHhHHHHHHHHHHK',
    '.........KHHKHHHKHHHHHK',
    '.........KHKSSHKSSSHHK',
  ],
  largo: [
    '',
    '',
    '',
    '............KKKKKK',
    '..........KKHHHHHHKK',
    '.........KHHHHHHHHHHK',
    '........KHHHHHHHHHHHHK',
    '........KHHHHhHHHHHHHK',
    '........KHHHHHHHHHHHHHK',
    '........KHHhHHHHHHHHHHK',
    '........KHHHHKHHHHKHHHK',
    '........KHHHKSSSSSSKHHK',
  ],
  coletas: [
    '....KK................KK',
    '...KHHK..............KHHK',
    '...KHHK....KKKKKK....KHHK',
    '....KHHK.KKHHHHHHKK.KHHK',
    '.....KHHKHHHHHHHHHHKHHK',
    '......KHHHHHHHHHHHHHHK',
    '.......KHHHHHHHHHHHHK',
    '.......KHHHhHHHHHHHHK',
    '.......KHHHHHHHHHHHHHK',
    '........KHHhHHHHHHHHK',
    '........KHHKHHHKHHHHK',
    '........KHKSSSSSSSHHK',
  ],
  banda: [
    '...........K....K',
    '........K.KHK..KHK..K',
    '.......KHKHHHKKHHHKKHK',
    '.....K.KHHHHHHHHHHHHHHK',
    '....KHKHHHHHHHHHHHHHHHHK',
    '.....KHHHHHHHHHHHHHHHHK',
    '......KHHHHHHHHHHHHHHHK',
    '.......KMMMMMMMMMMMMMMK',
    '.......KMMMMMMLLMMMMMMK',
    '.......KMmmmmmmmmmmmmMK',
    '........KHHKHHHKHHHHHK',
    '.........KHKSSSKSSSSHK',
  ],
  bandaAtras: [
    '',
    '.....KK',
    '....KHHKK......K',
    '...KHHHHHKK...KHK',
    '....KHHHHHHKKKHHK',
    '...KHHHHHHHHHHHHHKK',
    '..KHHHHHHHHHHHHHHHHK',
    '...KHHHHHHHHHHHHHHHK',
    '.....KMMMMMMMMMMMMMMK',
    '.....KMMMMMMMLLMMMMMK',
    '......KHHKHHHHKHHHHK',
    '.......KHKSSSSSKSSHK',
  ],
  bandaLado: [
    '...K.K',
    '..KHKHK.K',
    '.KHHHHHKHK.K',
    '.KHHHHHHHHKHK',
    '..KHHHHHHHHHHKK',
    '...KHHHHHHHHHHHHK',
    '....KHHHHHHHHHHHHHK',
    '......KMMMMMMMMMMMMMK',
    '......KMMMMMMMMLLMMMK',
    '.......KMmmmmmmmmmmMK',
    '........KHHKHHHKHHHK',
    '.........KHKSSSKSSHK',
  ],
  sombrero: [
    '',
    '',
    '...........KKKKKKKK',
    '..........KYYYYYYYYK',
    '.........KYYYYYYYYYYK',
    '.........KYyYYYYYYyYK',
    '.........KRRRRRRRRRRK',
    '.....KKKKYYYYYYYYYYYYKKKK',
    '....KYYYYYYYYYYYYYYYYYYYYK',
    '.....KKyyyyyyyyyyyyyyyyKK',
    '.........KHHKHHHKHHHHK',
    '.........KHKSSSKSSSHK',
  ],
  turbante: [
    '',
    '',
    '...........KKKKKKK',
    '.........KKWWWWWWWKK',
    '........KWWWWWWWWWWWK',
    '........KWwWWWWWWWwWK',
    '........KPPPPPPPPPPPK',
    '........KPpppppppppPK',
    '........KWWWWWWWWWWWK',
    '.........KWwwwwwwwWK',
    '.........KKSSSSSSSSK',
    '.........KSSSSSSSSSK',
  ],
  antenas: [
    '.......KK.........KK',
    '......KHHK.......KHHK',
    '......KHHK.......KHHK',
    '.......KHHK.....KHHK',
    '.......KHHK.....KHHK',
    '........KHHK...KHHK',
    '.........KHHKKKHHK',
    '........KHHHHHHHHHHK',
    '.......KHHHHHHHHHHHHK',
    '.......KHHhHHHHHHHHHHK',
    '........KHHKHHHHKHHHK',
    '........KHKSSSSSSSSHK',
  ],
  cuernos: [
    '.........KK......KK',
    '.........KWK....KWK',
    '..........KWK..KWK',
    '...........KWKKWK',
    '..........KKHHHHKK',
    '.........KHHHHHHHHK',
    '........KHHHHHHHHHHK',
    '........KHHHhHHHHHHHK',
    '.......KHHHHHHHHHHHHK',
    '........KHHhHHHHHHHHK',
    '.........KHHKHHHKHHHK',
    '.........KHKSSHKSSSHK',
  ],
  jabali: [
    '..........K........K',
    '.........KGK......KGK',
    '.........KGGK....KGGK',
    '........KGGGGKKKKGGGGK',
    '.......KGGGGGGGGGGGGGGK',
    '.......KGGgGGGGGGGGgGGK',
    '.......KGGGGGGGGGGGGGGK',
    '.......KGgGGGGGGGGGGgGK',
    '.......KGGGGGGGGGGGGGGK',
    '.......KGGWKGGGGGGWKGGK',
    '.......KGGGGGGGGGGGGGGK',
    '........KGGGGGGGGGGGGK',
  ],
};
// Todoroki: el pelo "corto" con la mitad izquierda de otro color (h)
PELOS.mitad = PELOS.corto.map((f) => [...f].map((c, x) => (x < 16 && c === 'H' ? 'h' : c)).join(''));

// ---------- Caras (9 filas): ojos estilo anime con brillo (W) e iris (E) ----------
const OJOS = [
  '.........KHHSSSSSSSSHHK',
  '.........KHSSSSSSSSSSHK',
  '.........KHSKKSSSSKKSSK',
  '.........KSSWEsSSSWEsSK',
  '.........KSSWEsSSSWEsSK',
];
const BOCA = [
  '..........KSSSSSSsSSSK',
  '..........KsSSSKKSSSK',
  '...........KsSSSSSSK',
  '............KKsssKK',
];
const CARAS = {
  normal: [...OJOS, ...BOCA],
  larga: [
    '........KHHHSSSSSSSSHHHK',
    '........KHHSSSSSSSSSSHHK',
    '........KHHSKKSSSSKKSHHK',
    '........KHHSWEsSSSWEsHHK',
    '........KHHSWEsSSSWEsHHK',
    '........KHHKSSSSSsSSKHHK',
    '........KHHKsSSKKSSKHHK',
    '........KHHHKsSSSSKHHHK',
    '........KHHHHKKsssKHHHHK',
  ],
  mascara: [...OJOS, '..........KMMMMMMMMMMK', '..........KMmmmmmmmMK', '...........KMMMMMMMK', '............KKsssKK'],
  venda: [
    '.........KHHSSSSSSSSHHK',
    '.........KHSSSSSSSSSSHK',
    '.........KWWWWWWWWWWWWK',
    '.........KWwwwwwwwwwwWK',
    '.........KSSSSSSSSSSSSK',
    ...BOCA,
  ],
  cicatriz: [
    '.........KHHSSSSSSSSHHK',
    '.........KHSSSSSSSSSSHK',
    '.........KHRKKSSSSKKSSK',
    '.........KSRWEsSSSWEsSK',
    '.........KRSWEsSSSWEsSK',
    ...BOCA,
  ],
  jabali: [
    '.......KGGGGNNNNNNGGGGK',
    '.......KGGGNNNNNNNNGGGK',
    '.......KGGGNKNNNNKNGGGK',
    '.......KGGGNNNNNNNNGGGK',
    '........KGGGnnnnnnGGGK',
    '.........KGGGGGGGGGK',
    '..........KSSKKSSK',
    '...........KsSSSK',
    '............KKKK',
  ],
};

// ---------- Cuerpo (30 filas) = torso (14) + piernas (16) ----------
// Ropa propia sin copiar a nadie: son moldes de prendas comunes (abrigo, falda,
// chaleco abierto, estampado a cuadros) que comparten varios personajes.
const TORSO = [
  '............KsSSsK',
  '.........KKKAACCAAKKK',
  '.......KKAAAAACCAAAAAKK',
  '......KAAAAAAACCAAAAAaaK',
  '.....KaAAAAAAACCAAAAAAaaK',
  '.....KaAAKAAAACCAAAAKAaaK',
  '....KsSKaAAAAACCAAAAAKaSsK',
  '....KSSKaAAAAACCAAAAAKaSSK',
  '....KSsKaAAAAACCAAAAAKaSsK',
  '....KSSKKaAAAACCAAAAKKKSSK',
  '....KDDK.KaAAACCAAAaK.KDDK',
  '....KSSK.KCCCCCCCCCCK.KSSK',
  '....KssK.KPPPPPPPPPPK.KssK', // cadera (P; con abrigo o falda pasa a ser A)
  '.....KK..KPPPPPPPPPPK..KK',
];
const PIERNA = '.........KPPPpK.KPPPpK';
const TOBILLOS_Y_PIES = [
  '.........KDDDDK.KDDDDK',
  '.........KFFFFFFKFFFFFFK',
  '.........KFFFFFFKFFFFFFFK',
  '.........KKKKKKKKKKKKKKKK',
];
const PIERNAS = {
  pantalon: [
    '.........KPPPPpKPPPPpK',
    PIERNA, PIERNA, PIERNA,
    '.........KPPpPK.KPPpPK', // rodillas
    PIERNA, PIERNA, PIERNA, PIERNA, PIERNA, PIERNA,
    ...TOBILLOS_Y_PIES,
  ],
  /** Abrigo, haori o túnica que llega a las rodillas. */
  abrigo: [
    '........KaAAAAAKAAAAAaK',
    '........KaAAAAK.KAAAAaK',
    '.......KaAAAAAK.KAAAAAaK',
    '.......KaAAAAAK.KAAAAAaK',
    '.......KaAAAAK...KAAAAaK',
    '.......KaAAAAK...KAAAAaK',
    '.......KKKKKKK...KKKKKKK',
    PIERNA, PIERNA, PIERNA, PIERNA, PIERNA,
    ...TOBILLOS_Y_PIES,
  ],
  /** Falda o kimono, con las piernas debajo. */
  falda: [
    '.........KAAAAAAAAAAK',
    '........KAAAAAAAAAAAAK',
    '........KaAAAAAAAAAAaK',
    '.......KaAAAAAAAAAAAAaK',
    '.......KaAAAAAAAAAAAAaK',
    '.......KaAaAAaAAaAAaAaK',
    '.......KKKKKKKKKKKKKKKK',
    '..........KSSK.KSSK',
    '..........KSsK.KSsK',
    '..........KSsK.KSsK',
    '..........KSsK.KSsK',
    '..........KDDK.KDDK',
    '.........KFFFFKKFFFFK',
    '.........KKKKKKKKKKKK',
  ],
};

/** Cambia letras en ciertas filas y columnas (para armar variantes de ropa). */
const cambiar = (filas, desde, hasta, regla) =>
  filas.map((f, y) => (y < desde || y > hasta ? f : [...f].map((c, x) => regla(c, x, y)).join('')));

/**
 * Arma el cuerpo con su ropa.
 * ropa: { piernas: 'pantalon'|'abrigo'|'falda', abierto, cuadros, ancho }
 *  - abierto: chaleco o chaqueta abierta (se ve el pecho)
 *  - cuadros: estampado a cuadros con un segundo color B (haori)
 *  - ancho: espalda y piernas más anchas (personajes musculosos)
 */
function armarCuerpo({ piernas = 'pantalon', abierto = false, cuadros = false, ancho = false } = {}) {
  let torso = TORSO;
  let abajo = PIERNAS[piernas];
  if (piernas !== 'pantalon') torso = cambiar(torso, 12, 13, (c) => (c === 'P' ? 'A' : c));
  if (abierto) torso = cambiar(torso, 1, 10, (c, x) => (x >= 13 && x <= 16 && 'AaCc'.includes(c) ? 'S' : c));
  if (cuadros) {
    const cuadro = (c, x, y) => {
      if (((x >> 1) + (y >> 1)) % 2 === 0) return c;
      return c === 'A' ? 'B' : c === 'a' ? 'b' : c;
    };
    torso = cambiar(torso, 1, 13, cuadro);
    abajo = cambiar(abajo, 0, 6, cuadro);
  }
  let cuerpo = [...torso, ...abajo];
  // Más ancho: se duplican las columnas del centro del cuerpo
  if (ancho) cuerpo = cuerpo.map((f) => f.slice(0, 15) + f[14] + f[14] + f.slice(15));
  return cuerpo;
}

/** Versión oscura de un color (para las sombras). */
function oscurecer(color, factor = 0.68) {
  const r = Math.floor(((color >> 16) & 255) * factor);
  const g = Math.floor(((color >> 8) & 255) * factor);
  const b = Math.floor((color & 255) * factor);
  return (r << 16) | (g << 8) | b;
}

// ---------- Especiales (los 4 tipos que entiende el motor) ----------
const proyectil = (nombre, color, extra = {}) => ({ tipo: 'proyectil', nombre, carga: 0.3, velocidad: 420, radio: 10, daño: 12, empuje: 420, angulo: 30, color, ...extra });
const clon = (nombre, extra = {}) => ({ tipo: 'clon', nombre, distancia: 200, duracion: 0.4, daño: 10, empuje: 380, angulo: 35, ...extra });
const estirar = (nombre, extra = {}) => ({ tipo: 'estirar', nombre, alcance: 150, duracion: 0.32, daño: 13, empuje: 430, angulo: 25, ...extra });
const escudo = (nombre, color, extra = {}) => ({ tipo: 'escudo', nombre, color, duracion: 0.9, daño: 0, empuje: 0, angulo: 0, ...extra });
const embestida = (nombre, extra = {}) => ({ tipo: 'embestida', nombre, distancia: 130, duracion: 0.25, daño: 11, empuje: 400, angulo: 30, ...extra });

/**
 * Arma un luchador a partir de sus piezas.
 * colores: { H, A, C, D, P, F, S? y extras como M, W, R… }
 */
function luchador({ nombre, lema, color, pelo, cara = 'normal', ropa = {}, colores, especial, poderes = null, espada = false, stats = {}, poder = null }) {
  const base = { K, S: PIEL, E: 0x202030, B: 0x24242c, W: 0xffffff, M: 0x9aa4b0, L: 0x40485a, R: 0xd02828, Y: 0xf0d060, P: 0x7040a0, G: 0x8a8a90, N: 0xe0a0a0, ...colores };
  // Sombras: cada mayúscula tiene su minúscula oscura (salvo que ya venga definida)
  const paleta = { ...base };
  for (const [letra, c] of Object.entries(base)) {
    if (letra === letra.toUpperCase() && paleta[letra.toLowerCase()] === undefined) paleta[letra.toLowerCase()] = oscurecer(c);
  }
  return {
    nombre, lema, color,
    poderes, // opcional: { lado, abajo, super } → más de un poder
    stats: { peso: 1, velocidad: 240, salto: 580, ...stats },
    golpe: espada
      ? { alcance: 44, daño: 6, empuje: 250, angulo: 35, duracion: 0.22, espada: true }
      : { alcance: 30, daño: 6, empuje: 260, angulo: 35, duracion: 0.22 },
    especial,
    paleta,
    paletaPoder: poder,
    arte: [...bloque(PELOS[pelo], 12), ...bloque(CARAS[cara], 9), ...bloque(armarCuerpo(ropa), 30)],
  };
}

// ---------- Las 8 series ----------
const NARANJA = 0xf08020, AZUL = 0x2050c0, NEGRO = 0x24242c, BLANCO = 0xf0f0f0, ROJO = 0xd02828;

export const SERIES = {
  dragonball: {
    nombre: 'Dragon Ball', color: '#f08020',
    luchadores: {
      goku: luchador({ nombre: 'GOKU', lema: 'Saiyajin criado en la Tierra', color: '#f08020', pelo: 'puntas', colores: { H: 0x202030, A: NARANJA, C: AZUL, D: AZUL, P: NARANJA, F: AZUL }, especial: proyectil('Kamehameha', 0x7fd8ff), poder: { H: 0xffd84d } }),
      vegeta: luchador({ nombre: 'VEGETA', lema: 'Príncipe de los Saiyajin', color: '#3a60d0', pelo: 'llama', colores: { H: 0x202030, A: 0x3050c0, C: BLANCO, D: BLANCO, P: 0x3050c0, F: BLANCO }, especial: proyectil('Galick Gun', 0xb070ff, { daño: 13 }), poder: { H: 0xffd84d }, stats: { velocidad: 250 } }),
      gohan: luchador({ nombre: 'GOHAN', lema: 'Hijo de Goku', color: '#8040c0', pelo: 'puntas', colores: { H: 0x202030, A: 0x7040a0, C: ROJO, D: ROJO, P: 0x7040a0, F: 0x6a4020 }, especial: proyectil('Masenko', 0xffe060), poder: { H: 0xffd84d } }),
      piccolo: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'PICCOLO', lema: 'Guerrero namekiano', color: '#3aa040', pelo: 'turbante', colores: { H: 0xf0f0f0, S: 0x58b048, A: 0x5a3a90, C: 0x5aa0e0, D: ROJO, P: 0x5a3a90, F: 0x6a4020 }, especial: estirar('Brazo namekiano', { alcance: 160 }), stats: { peso: 1.1, velocidad: 220 } }),
    },
  },
  naruto: {
    nombre: 'Naruto', color: '#f8a020',
    luchadores: {
      naruto: luchador({ nombre: 'NARUTO', lema: 'El ninja que nunca se rinde', color: '#f8a020', pelo: 'banda', colores: { H: 0xffd040, A: 0xf89020, C: NEGRO, D: NEGRO, P: 0xf89020, F: 0x3050a0 }, especial: clon('Clon de sombra'), stats: { velocidad: 270, salto: 620, peso: 0.9 } }),
      sasuke: luchador({ nombre: 'SASUKE', lema: 'Último del clan Uchiha', color: '#4050a0', pelo: 'bandaAtras', colores: { H: 0x202030, A: 0xe8e8f0, C: 0x6050a0, D: 0x6050a0, P: 0x404050, F: 0x404050 }, especial: proyectil('Bola de fuego', 0xff7a20, { velocidad: 360, radio: 12 }), stats: { velocidad: 265 } }),
      kakashi: luchador({ nombre: 'KAKASHI', lema: 'El ninja copia', color: '#9aa4b0', pelo: 'bandaLado', cara: 'mascara', colores: { H: 0xd8d8e0, M: 0x30384a, A: 0x4a6a40, C: 0x30384a, D: 0x30384a, P: 0x30384a, F: 0x30384a }, especial: embestida('Chidori', { daño: 12, distancia: 150 }) }),
      sakura: luchador({ nombre: 'SAKURA', lema: 'Ninja médico de fuerza brutal', color: '#f080b0', pelo: 'largo', cara: 'larga', colores: { H: 0xf8a0c8, A: ROJO, C: 0xf0f0f0, D: 0xf0f0f0, P: 0x404050, F: 0x404050 }, especial: embestida('Puño de cerezo', { distancia: 90, daño: 14, empuje: 460 }) }),
    },
  },
  onepiece: {
    nombre: 'One Piece', color: '#d02828',
    luchadores: {
      luffy: luchador({ ropa: { abierto: true },  nombre: 'LUFFY', lema: 'Será el Rey de los Piratas', color: '#d02828', pelo: 'sombrero', cara: 'cicatriz', colores: { H: 0x202030, A: ROJO, C: PIEL, D: PIEL, P: 0x3060c0, F: 0xc89040 }, especial: estirar('Gomu Gomu no Pistol'), stats: { peso: 1.05 } }),
      zoro: luchador({ nombre: 'ZORO', lema: 'Espadachín de tres espadas', color: '#2a9a4a', pelo: 'corto', colores: { H: 0x48b048, A: BLANCO, C: 0x2a7a3a, D: BLANCO, P: 0x303038, F: 0x303038 }, especial: embestida('Santoryu', { daño: 12 }), espada: true, stats: { peso: 1.1 } }),
      sanji: luchador({ nombre: 'SANJI', lema: 'Cocinero de patadas de fuego', color: '#e8c040', pelo: 'corto', colores: { H: 0xf0d060, A: 0x30303a, C: 0x3060c0, D: 0x30303a, P: 0x30303a, F: 0x202028 }, especial: embestida('Diable Jambe', { distancia: 110, daño: 12 }), stats: { velocidad: 260 } }),
      nami: luchador({ nombre: 'NAMI', lema: 'Navegante del clima', color: '#f08030', pelo: 'largo', cara: 'larga', colores: { H: 0xf08030, A: 0x60a0e0, C: 0xf0f0f0, D: PIEL, P: 0x304080, F: 0xc89040 }, especial: proyectil('Thunderbolt Tempo', 0xffe040, { velocidad: 480, radio: 8 }), stats: { peso: 0.9 } }),
    },
  },
  bleach: {
    nombre: 'Bleach', color: '#f07020',
    luchadores: {
      ichigo: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'ICHIGO', lema: 'Shinigami sustituto', color: '#f07020', pelo: 'puntas', colores: { H: 0xf07020, A: NEGRO, C: BLANCO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: proyectil('Getsuga Tensho', 0x202060, { radio: 14, daño: 13 }), espada: true }),
      rukia: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'RUKIA', lema: 'Shinigami de hielo', color: '#a0c8f0', pelo: 'largo', cara: 'larga', colores: { H: 0x202030, A: NEGRO, C: BLANCO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: proyectil('Sode no Shirayuki', 0xd8f0ff, { velocidad: 380 }), espada: true, stats: { peso: 0.9 } }),
      renji: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'RENJI', lema: 'Teniente de la sexta división', color: '#d03030', pelo: 'puntas', colores: { H: ROJO, A: NEGRO, C: BLANCO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: estirar('Zabimaru', { alcance: 170 }), espada: true }),
      byakuya: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'BYAKUYA', lema: 'Capitán de la sexta división', color: '#f0a0c0', pelo: 'largo', cara: 'larga', colores: { H: 0x202030, A: BLANCO, C: NEGRO, D: BLANCO, P: NEGRO, F: 0xf0f0f0 }, especial: proyectil('Senbonzakura', 0xf8a0c8, { radio: 13, velocidad: 340 }), espada: true }),
    },
  },
  jujutsu: {
    nombre: 'Jujutsu Kaisen', color: '#4060c0',
    luchadores: {
      yuji: luchador({ nombre: 'YUJI', lema: 'Recipiente de Sukuna', color: '#e07090', pelo: 'corto', colores: { H: 0xf0a0b0, A: 0x203050, C: ROJO, D: 0x203050, P: 0x203050, F: ROJO }, especial: embestida('Puño divergente', { distancia: 100, daño: 13 }), stats: { velocidad: 265 } }),
      megumi: luchador({ nombre: 'MEGUMI', lema: 'Técnica de las diez sombras', color: '#303050', pelo: 'puntas', colores: { H: 0x202030, A: 0x203050, C: 0x203050, D: 0x203050, P: 0x203050, F: NEGRO }, especial: clon('Perros divinos', { daño: 11 }) }),
      nobara: luchador({ nombre: 'NOBARA', lema: 'Martillo y clavos', color: '#d07030', pelo: 'largo', cara: 'larga', colores: { H: 0xd07030, A: 0x203050, C: 0x203050, D: 0x203050, P: 0x203050, F: 0x6a4020 }, especial: proyectil('Resonancia', 0xc0c8d0, { radio: 6, velocidad: 520 }), stats: { peso: 0.9 } }),
      gojo: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'GOJO', lema: 'El hechicero más fuerte', color: '#80c0ff', pelo: 'puntas', cara: 'venda', colores: { H: 0xf0f0f8, A: 0x203050, C: 0x203050, D: 0x203050, P: 0x203050, F: NEGRO }, especial: proyectil('Azul', 0x3a7aff, { radio: 12, daño: 9, velocidad: 260, empuje: 300, atrae: true }),
        poderes: {
          lado: proyectil('Rojo', 0xff3040, { radio: 10, daño: 13, velocidad: 520, empuje: 560, angulo: 25, carga: 0.35 }),
          abajo: escudo('Infinito', 0x9ad8ff),
          super: proyectil('Púrpura hueco', 0xa050ff, { radio: 24, daño: 24, velocidad: 280, empuje: 700, angulo: 35, carga: 0.6, atraviesa: true }),
        } }),
    },
  },
  mha: {
    nombre: 'My Hero Academia', color: '#2a9a5a',
    luchadores: {
      deku: luchador({ nombre: 'DEKU', lema: 'Heredero del One For All', color: '#2a9a5a', pelo: 'corto', colores: { H: 0x205a30, A: 0x2a8a5a, C: NEGRO, D: BLANCO, P: 0x2a8a5a, F: ROJO }, especial: embestida('Detroit Smash', { daño: 13 }), stats: { velocidad: 260 } }),
      bakugo: luchador({ nombre: 'BAKUGO', lema: 'Explosiones con las manos', color: '#f0a020', pelo: 'puntas', colores: { H: 0xf8e080, A: NEGRO, C: 0xf09020, D: 0x2a6a3a, P: NEGRO, F: 0x404040 }, especial: proyectil('Explosión', 0xffa020, { velocidad: 300, radio: 15, daño: 13 }) }),
      todoroki: luchador({ nombre: 'TODOROKI', lema: 'Mitad hielo, mitad fuego', color: '#80c0f0', pelo: 'mitad', colores: { H: ROJO, h: 0xf0f0f0, A: 0x405080, C: 0x405080, D: BLANCO, P: 0x405080, F: 0x404040 }, especial: proyectil('Muro de hielo', 0xb8e8ff, { velocidad: 360, radio: 13 }) }),
      allmight: luchador({ ropa: { ancho: true },  nombre: 'ALL MIGHT', lema: 'El Símbolo de la Paz', color: '#3060d0', pelo: 'antenas', colores: { H: 0xffd040, A: 0x3060d0, C: ROJO, D: BLANCO, P: 0x3060d0, F: ROJO }, especial: embestida('United States of Smash', { daño: 15, empuje: 470 }), stats: { peso: 1.25, velocidad: 230, salto: 560 } }),
    },
  },
  tensura: {
    nombre: 'Slime (Tensura)', color: '#60b8f0',
    luchadores: {
      rimuru: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'RIMURU', lema: 'El slime más poderoso', color: '#60b8f0', pelo: 'largo', cara: 'larga', colores: { H: 0x80c8f0, A: NEGRO, C: 0x80c8f0, D: NEGRO, P: NEGRO, F: NEGRO }, especial: proyectil('Cuchilla de agua', 0x4ab0ff, { velocidad: 500, radio: 8 }) }),
      benimaru: luchador({ ropa: { piernas: 'abrigo' },  nombre: 'BENIMARU', lema: 'Ogro samurái de fuego negro', color: '#d03030', pelo: 'cuernos', colores: { H: ROJO, A: NEGRO, C: ROJO, D: NEGRO, P: NEGRO, F: NEGRO }, especial: proyectil('Llama del infierno', 0x401020, { radio: 13 }), espada: true }),
      shion: luchador({ ropa: { piernas: 'falda' },  nombre: 'SHION', lema: 'Secretaria con espada gigante', color: '#9050c0', pelo: 'cuernos', colores: { H: 0x8050c0, A: 0x303040, C: 0x8050c0, D: 0x303040, P: 0x303040, F: NEGRO }, especial: embestida('Espadazo', { daño: 14, distancia: 100 }), espada: true, stats: { peso: 1.1 } }),
      milim: luchador({ ropa: { piernas: 'falda' },  nombre: 'MILIM', lema: 'Señora demonio destructora', color: '#f070b0', pelo: 'coletas', colores: { H: 0xf080c0, A: NEGRO, C: 0xf0d060, D: NEGRO, P: NEGRO, F: NEGRO }, especial: proyectil('Drago Nova', 0xff60c0, { radio: 16, daño: 15, carga: 0.4 }), stats: { velocidad: 270, peso: 0.9 } }),
    },
  },
  demonslayer: {
    nombre: 'Demon Slayer', color: '#2a8a5a',
    luchadores: {
      tanjiro: luchador({ ropa: { piernas: 'abrigo', cuadros: true },  nombre: 'TANJIRO', lema: 'Respiración del agua', color: '#2a8a5a', pelo: 'corto', cara: 'cicatriz', colores: { H: 0x6a2020, B: 0x24242c, A: 0x2a8a5a, C: NEGRO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: embestida('Danza del dios del fuego', { daño: 12 }), espada: true }),
      nezuko: luchador({ ropa: { piernas: 'falda' },  nombre: 'NEZUKO', lema: 'Demonio que protege a su hermano', color: '#f080a0', pelo: 'largo', cara: 'mascara', colores: { H: 0x202030, M: 0x60a050, A: 0xf090b0, C: ROJO, D: 0xf090b0, P: 0xf090b0, F: NEGRO }, especial: estirar('Patada demoníaca', { alcance: 110, daño: 14 }), stats: { peso: 0.9, velocidad: 260 } }),
      zenitsu: luchador({ ropa: { piernas: 'abrigo', cuadros: true },  nombre: 'ZENITSU', lema: 'Respiración del trueno', color: '#f0d040', pelo: 'puntas', colores: { H: 0xffd84d, B: 0xf8f0d0, A: 0xf0c040, C: BLANCO, D: 0xf0c040, P: NEGRO, F: 0xf0f0f0 }, especial: embestida('Primera forma: relámpago', { distancia: 210, duracion: 0.2, daño: 12 }), espada: true, stats: { velocidad: 280, peso: 0.85 } }),
      inosuke: luchador({ ropa: { abierto: true },  nombre: 'INOSUKE', lema: 'Respiración de la bestia', color: '#8a8a90', pelo: 'jabali', cara: 'jabali', colores: { G: 0x8a8a90, N: 0xe0a0a0, A: PIEL, C: 0xa07840, D: PIEL, P: 0x6a5a40, F: NEGRO }, especial: embestida('Colmillos dobles', { daño: 12 }), espada: true, stats: { velocidad: 265 } }),
    },
  },
};

/** Todos los luchadores en un solo objeto: { goku: {...}, vegeta: {...}, ... } */
export const LUCHADORES = Object.fromEntries(
  Object.entries(SERIES).flatMap(([serie, s]) => Object.entries(s.luchadores).map(([id, l]) => [id, { ...l, serie }])),
);

/** Arte completo (32×51) de un luchador: pelo + cara + cuerpo. */
export const arteDe = (id) => LUCHADORES[id].arte;
