/**
 * Luchadores de Anime Rush: 32 personajes de 8 animes, 4 por serie.
 * Juego de fans, no oficial y sin fines de lucro (ver ADR 0011): los personajes
 * pertenecen a sus dueños; los dibujos son pixel art propio, hecho con letras.
 *
 * Cada luchador se arma con piezas para no dibujar 32 cabezas desde cero:
 *  - pelo: uno de PELOS (6 filas) · cara: una de CARAS (5 filas)
 *  - colores: H pelo, S piel, A ropa arriba, C centro, D muñecas, P pantalón, F pies (+ extras)
 *  - especial: uno de los 4 tipos del motor (proyectil, clon, estirar, embestida)
 *
 * Para agregar un luchador: agrega una línea con `luchador({...})` en su serie.
 */

const K = 0x181820;
const PIEL = 0xf8c898;

// ---------- Piezas de la cabeza ----------
const PELOS = {
  puntas: ['....K...K.......', '...KHK.KHK.K....', '..KHHHKHHHKHK...', '.KHHHHHHHHHHHK..', 'KHHHHHHHHHHHHHK.', '.KHHHHHHHHHHHK..'],
  llama: ['......KK........', '.....KHHK.......', '....KHHHHK......', '...KHHHHHHK.....', '..KHHHHHHHHK....', '.KHHHHHHHHHHK...'],
  corto: ['................', '....KKKKKK......', '..KKHHHHHHKK....', '.KHHHHHHHHHHK...', '.KHHHHHHHHHHK...', '.KHHKHHKHHHHK...'],
  largo: ['................', '....KKKKKK......', '...KHHHHHHK.....', '..KHHHHHHHHK....', '.KHHHHHHHHHHK...', '.KHHHHHHHHHHK...'],
  coletas: ['.K..........K...', 'KHK.KKKKKK.KHK..', 'KHHKHHHHHHKHHK..', '.KHHHHHHHHHHK...', '.KHHHHHHHHHHK...', '.KHHHHHHHHHHK...'],
  banda: ['.....K..K.......', '..K.KHKKHK.K....', '.KHKHHHHHHKHK...', 'KHHHHHHHHHHHHK..', '.KMMMMMMMMMMMK..', '.KMMMMMLMMMMMK..'],
  bandaAtras: ['................', '....KKKKK.KK....', '...KHHHHHKHHK...', '..KHHHHHHHHHHK..', '..KMMMMMMMMMMK..', '..KMMMMMLMMMMK..'],
  bandaLado: ['..K.K.K.........', '.KHKHKHK........', 'KHHHHHHHKK......', '.KHHHHHHHHHK....', '.KMMMMMMMMMMK...', '.KMMMMMLMMMMK...'],
  sombrero: ['.....KKKKKK.....', '....KYYYYYYK....', '...KYYYYYYYYK...', '...KRRRRRRRRK...', 'KKKYYYYYYYYYYKKK', '.KYYYYYYYYYYYYK.'],
  turbante: ['.....KKKKKK.....', '....KWWWWWWK....', '...KWWWWWWWWK...', '...KPPPPPPPPK...', '...KWWWWWWWWK...', '....KWWWWWWK....'],
  mitad: ['................', '....KKKKKK......', '..KKhhhHHHKK....', '.KhhhhhHHHHHK...', '.KhhhhhHHHHHK...', '.KhhKhhKHHHHK...'],
  antenas: ['..K.......K.....', '.KHK.....KHK....', '.KHHK...KHHK....', '..KHHKKKHHK.....', '.KHHHHHHHHHK....', '.KHHHHHHHHHK....'],
  cuernos: ['..K........K....', '..KWK....KWK....', '...KWKKKKWK.....', '..KHHHHHHHHK....', '.KHHHHHHHHHHK...', '.KHHHHHHHHHHK...'],
  jabali: ['...K......K.....', '..KGK....KGK....', '..KGGKKKKGGK....', '.KGGGGGGGGGGK...', '.KGWKGGGGWKGK...', '.KGGGGGGGGGGK...'],
};

const CARAS = {
  normal: ['..KHHSSSSSSHK...', '..KHSSSSKSSSK...', '..KSSSSSKSSSK...', '...KSSSSSSSK....', '....KSSSSSK.....'],
  larga: ['.KHHSSSSSSHHK...', '.KHSSSSKSSSHK...', '.KHSSSSKSSSHK...', '.KHKSSSSSSKHK...', '..K.KSSSSSK.K...'],
  mascara: ['..KHHSSSSSSHK...', '..KHSSSSKSSSK...', '..KMMMMMMMMMK...', '...KMMMMMMMK....', '....KMMMMMK.....'],
  venda: ['..KWWWWWWWWWK...', '..KWWWWWWWWWK...', '..KSSSSSSSSSK...', '...KSSSSSSSK....', '....KSSSSSK.....'],
  cicatriz: ['..KHHSSSSSSHK...', '..KHRSSSKSSSK...', '..KRSSSSKSSSK...', '...KSSSSSSSK....', '....KSSSSSK.....'],
  jabali: ['..KGGNNNNNGGK...', '..KGNKNNNKNGK...', '..KGGNNNNNGGK...', '...KGGGGGGGK....', '....KSSSSSK.....'],
};

/** Plantilla del cuerpo (13 filas). A = ropa arriba · C = centro · D = muñecas · P = pantalón · F = pies */
const CUERPO = [
  '...KAAACAAAK....',
  '..KAAAACAAAAK...',
  '.KSAAAACAAAASK..',
  '.KSKAAAAAAAKSK..',
  '.KDKAAAAAAAKDK..',
  '..K.KCCCCCK.K...',
  '....KPPPPPK.....',
  '....KPPKPPK.....',
  '....KPPKPPK.....',
  '....KPPKPPK.....',
  '....KFFKFFK.....',
  '...KFFFKFFFK....',
  '...KKKKKKKKK....',
];

// ---------- Especiales (los 4 tipos que entiende el motor) ----------
const proyectil = (nombre, color, extra = {}) => ({ tipo: 'proyectil', nombre, carga: 0.3, velocidad: 420, radio: 10, daño: 12, empuje: 420, angulo: 30, color, ...extra });
const clon = (nombre, extra = {}) => ({ tipo: 'clon', nombre, distancia: 200, duracion: 0.4, daño: 10, empuje: 380, angulo: 35, ...extra });
const estirar = (nombre, extra = {}) => ({ tipo: 'estirar', nombre, alcance: 150, duracion: 0.32, daño: 13, empuje: 430, angulo: 25, ...extra });
const embestida = (nombre, extra = {}) => ({ tipo: 'embestida', nombre, distancia: 130, duracion: 0.25, daño: 11, empuje: 400, angulo: 30, ...extra });

/**
 * Arma un luchador a partir de sus piezas.
 * colores: { H, A, C, D, P, F, S? y extras como M, W, R… }
 */
function luchador({ nombre, lema, color, pelo, cara = 'normal', colores, especial, espada = false, stats = {}, poder = null }) {
  const paleta = { K, S: PIEL, W: 0xffffff, M: 0x9aa4b0, L: 0x40485a, R: 0xd02828, Y: 0xf0d060, P: 0x7040a0, G: 0x8a8a90, h: 0xf0f0f0, ...colores };
  return {
    nombre, lema, color,
    stats: { peso: 1, velocidad: 240, salto: 580, ...stats },
    golpe: espada
      ? { alcance: 44, daño: 6, empuje: 250, angulo: 35, duracion: 0.22, espada: true }
      : { alcance: 30, daño: 6, empuje: 260, angulo: 35, duracion: 0.22 },
    especial,
    paleta,
    paletaPoder: poder,
    cabeza: [...PELOS[pelo], ...CARAS[cara]],
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
      piccolo: luchador({ nombre: 'PICCOLO', lema: 'Guerrero namekiano', color: '#3aa040', pelo: 'turbante', colores: { H: 0xf0f0f0, S: 0x58b048, A: 0x5a3a90, C: 0x5aa0e0, D: ROJO, P: 0x5a3a90, F: 0x6a4020 }, especial: estirar('Brazo namekiano', { alcance: 160 }), stats: { peso: 1.1, velocidad: 220 } }),
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
      luffy: luchador({ nombre: 'LUFFY', lema: 'Será el Rey de los Piratas', color: '#d02828', pelo: 'sombrero', cara: 'cicatriz', colores: { H: 0x202030, A: ROJO, C: PIEL, D: PIEL, P: 0x3060c0, F: 0xc89040 }, especial: estirar('Gomu Gomu no Pistol'), stats: { peso: 1.05 } }),
      zoro: luchador({ nombre: 'ZORO', lema: 'Espadachín de tres espadas', color: '#2a9a4a', pelo: 'corto', colores: { H: 0x48b048, A: BLANCO, C: 0x2a7a3a, D: BLANCO, P: 0x303038, F: 0x303038 }, especial: embestida('Santoryu', { daño: 12 }), espada: true, stats: { peso: 1.1 } }),
      sanji: luchador({ nombre: 'SANJI', lema: 'Cocinero de patadas de fuego', color: '#e8c040', pelo: 'corto', colores: { H: 0xf0d060, A: 0x30303a, C: 0x3060c0, D: 0x30303a, P: 0x30303a, F: 0x202028 }, especial: embestida('Diable Jambe', { distancia: 110, daño: 12 }), stats: { velocidad: 260 } }),
      nami: luchador({ nombre: 'NAMI', lema: 'Navegante del clima', color: '#f08030', pelo: 'largo', cara: 'larga', colores: { H: 0xf08030, A: 0x60a0e0, C: 0xf0f0f0, D: PIEL, P: 0x304080, F: 0xc89040 }, especial: proyectil('Thunderbolt Tempo', 0xffe040, { velocidad: 480, radio: 8 }), stats: { peso: 0.9 } }),
    },
  },
  bleach: {
    nombre: 'Bleach', color: '#f07020',
    luchadores: {
      ichigo: luchador({ nombre: 'ICHIGO', lema: 'Shinigami sustituto', color: '#f07020', pelo: 'puntas', colores: { H: 0xf07020, A: NEGRO, C: BLANCO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: proyectil('Getsuga Tensho', 0x202060, { radio: 14, daño: 13 }), espada: true }),
      rukia: luchador({ nombre: 'RUKIA', lema: 'Shinigami de hielo', color: '#a0c8f0', pelo: 'largo', cara: 'larga', colores: { H: 0x202030, A: NEGRO, C: BLANCO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: proyectil('Sode no Shirayuki', 0xd8f0ff, { velocidad: 380 }), espada: true, stats: { peso: 0.9 } }),
      renji: luchador({ nombre: 'RENJI', lema: 'Teniente de la sexta división', color: '#d03030', pelo: 'puntas', colores: { H: ROJO, A: NEGRO, C: BLANCO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: estirar('Zabimaru', { alcance: 170 }), espada: true }),
      byakuya: luchador({ nombre: 'BYAKUYA', lema: 'Capitán de la sexta división', color: '#f0a0c0', pelo: 'largo', cara: 'larga', colores: { H: 0x202030, A: BLANCO, C: NEGRO, D: BLANCO, P: NEGRO, F: 0xf0f0f0 }, especial: proyectil('Senbonzakura', 0xf8a0c8, { radio: 13, velocidad: 340 }), espada: true }),
    },
  },
  jujutsu: {
    nombre: 'Jujutsu Kaisen', color: '#4060c0',
    luchadores: {
      yuji: luchador({ nombre: 'YUJI', lema: 'Recipiente de Sukuna', color: '#e07090', pelo: 'corto', colores: { H: 0xf0a0b0, A: 0x203050, C: ROJO, D: 0x203050, P: 0x203050, F: ROJO }, especial: embestida('Puño divergente', { distancia: 100, daño: 13 }), stats: { velocidad: 265 } }),
      megumi: luchador({ nombre: 'MEGUMI', lema: 'Técnica de las diez sombras', color: '#303050', pelo: 'puntas', colores: { H: 0x202030, A: 0x203050, C: 0x203050, D: 0x203050, P: 0x203050, F: NEGRO }, especial: clon('Perros divinos', { daño: 11 }) }),
      nobara: luchador({ nombre: 'NOBARA', lema: 'Martillo y clavos', color: '#d07030', pelo: 'largo', cara: 'larga', colores: { H: 0xd07030, A: 0x203050, C: 0x203050, D: 0x203050, P: 0x203050, F: 0x6a4020 }, especial: proyectil('Resonancia', 0xc0c8d0, { radio: 6, velocidad: 520 }), stats: { peso: 0.9 } }),
      gojo: luchador({ nombre: 'GOJO', lema: 'El hechicero más fuerte', color: '#80c0ff', pelo: 'puntas', cara: 'venda', colores: { H: 0xf0f0f8, A: 0x203050, C: 0x203050, D: 0x203050, P: 0x203050, F: NEGRO }, especial: proyectil('Púrpura hueco', 0xa050ff, { radio: 16, daño: 15, velocidad: 300, carga: 0.45 }) }),
    },
  },
  mha: {
    nombre: 'My Hero Academia', color: '#2a9a5a',
    luchadores: {
      deku: luchador({ nombre: 'DEKU', lema: 'Heredero del One For All', color: '#2a9a5a', pelo: 'corto', colores: { H: 0x205a30, A: 0x2a8a5a, C: NEGRO, D: BLANCO, P: 0x2a8a5a, F: ROJO }, especial: embestida('Detroit Smash', { daño: 13 }), stats: { velocidad: 260 } }),
      bakugo: luchador({ nombre: 'BAKUGO', lema: 'Explosiones con las manos', color: '#f0a020', pelo: 'puntas', colores: { H: 0xf8e080, A: NEGRO, C: 0xf09020, D: 0x2a6a3a, P: NEGRO, F: 0x404040 }, especial: proyectil('Explosión', 0xffa020, { velocidad: 300, radio: 15, daño: 13 }) }),
      todoroki: luchador({ nombre: 'TODOROKI', lema: 'Mitad hielo, mitad fuego', color: '#80c0f0', pelo: 'mitad', colores: { H: ROJO, h: 0xf0f0f0, A: 0x405080, C: 0x405080, D: BLANCO, P: 0x405080, F: 0x404040 }, especial: proyectil('Muro de hielo', 0xb8e8ff, { velocidad: 360, radio: 13 }) }),
      allmight: luchador({ nombre: 'ALL MIGHT', lema: 'El Símbolo de la Paz', color: '#3060d0', pelo: 'antenas', colores: { H: 0xffd040, A: 0x3060d0, C: ROJO, D: BLANCO, P: 0x3060d0, F: ROJO }, especial: embestida('United States of Smash', { daño: 15, empuje: 470 }), stats: { peso: 1.25, velocidad: 230, salto: 560 } }),
    },
  },
  tensura: {
    nombre: 'Slime (Tensura)', color: '#60b8f0',
    luchadores: {
      rimuru: luchador({ nombre: 'RIMURU', lema: 'El slime más poderoso', color: '#60b8f0', pelo: 'largo', cara: 'larga', colores: { H: 0x80c8f0, A: NEGRO, C: 0x80c8f0, D: NEGRO, P: NEGRO, F: NEGRO }, especial: proyectil('Cuchilla de agua', 0x4ab0ff, { velocidad: 500, radio: 8 }) }),
      benimaru: luchador({ nombre: 'BENIMARU', lema: 'Ogro samurái de fuego negro', color: '#d03030', pelo: 'cuernos', colores: { H: ROJO, A: NEGRO, C: ROJO, D: NEGRO, P: NEGRO, F: NEGRO }, especial: proyectil('Llama del infierno', 0x401020, { radio: 13 }), espada: true }),
      shion: luchador({ nombre: 'SHION', lema: 'Secretaria con espada gigante', color: '#9050c0', pelo: 'cuernos', colores: { H: 0x8050c0, A: 0x303040, C: 0x8050c0, D: 0x303040, P: 0x303040, F: NEGRO }, especial: embestida('Espadazo', { daño: 14, distancia: 100 }), espada: true, stats: { peso: 1.1 } }),
      milim: luchador({ nombre: 'MILIM', lema: 'Señora demonio destructora', color: '#f070b0', pelo: 'coletas', colores: { H: 0xf080c0, A: NEGRO, C: 0xf0d060, D: NEGRO, P: NEGRO, F: NEGRO }, especial: proyectil('Drago Nova', 0xff60c0, { radio: 16, daño: 15, carga: 0.4 }), stats: { velocidad: 270, peso: 0.9 } }),
    },
  },
  demonslayer: {
    nombre: 'Demon Slayer', color: '#2a8a5a',
    luchadores: {
      tanjiro: luchador({ nombre: 'TANJIRO', lema: 'Respiración del agua', color: '#2a8a5a', pelo: 'corto', cara: 'cicatriz', colores: { H: 0x6a2020, A: 0x2a8a5a, C: NEGRO, D: NEGRO, P: NEGRO, F: 0xf0f0f0 }, especial: embestida('Danza del dios del fuego', { daño: 12 }), espada: true }),
      nezuko: luchador({ nombre: 'NEZUKO', lema: 'Demonio que protege a su hermano', color: '#f080a0', pelo: 'largo', cara: 'mascara', colores: { H: 0x202030, M: 0x60a050, A: 0xf090b0, C: ROJO, D: 0xf090b0, P: 0xf090b0, F: NEGRO }, especial: estirar('Patada demoníaca', { alcance: 110, daño: 14 }), stats: { peso: 0.9, velocidad: 260 } }),
      zenitsu: luchador({ nombre: 'ZENITSU', lema: 'Respiración del trueno', color: '#f0d040', pelo: 'puntas', colores: { H: 0xffd84d, A: 0xf0c040, C: BLANCO, D: 0xf0c040, P: NEGRO, F: 0xf0f0f0 }, especial: embestida('Primera forma: relámpago', { distancia: 210, duracion: 0.2, daño: 12 }), espada: true, stats: { velocidad: 280, peso: 0.85 } }),
      inosuke: luchador({ nombre: 'INOSUKE', lema: 'Respiración de la bestia', color: '#8a8a90', pelo: 'jabali', cara: 'jabali', colores: { G: 0x8a8a90, N: 0xe0a0a0, A: PIEL, C: 0xa07840, D: PIEL, P: 0x6a5a40, F: NEGRO }, especial: embestida('Colmillos dobles', { daño: 12 }), espada: true, stats: { velocidad: 265 } }),
    },
  },
};

/** Todos los luchadores en un solo objeto: { goku: {...}, vegeta: {...}, ... } */
export const LUCHADORES = Object.fromEntries(
  Object.entries(SERIES).flatMap(([serie, s]) => Object.entries(s.luchadores).map(([id, l]) => [id, { ...l, serie }])),
);

/** Arte completo (16×24) de un luchador: su cabeza + la plantilla del cuerpo. */
export const arteDe = (id) => [...LUCHADORES[id].cabeza, ...CUERPO];
