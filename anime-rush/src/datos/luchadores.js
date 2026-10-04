/**
 * Luchadores de Anime Rush: personajes ORIGINALES con estilo anime (ADR 0008).
 *
 * Cada luchador tiene:
 *  - nombre, lema y color (para menús y HUD)
 *  - stats: peso (más = sale volando menos), velocidad, salto
 *  - golpe: el ataque básico (A) → { alcance, daño, empuje, angulo, duracion }
 *  - especial: el ataque especial (B) → { tipo, ... } (ver nucleo/pelea.js)
 *  - cabeza: 11 filas de 16 letras; el cuerpo usa una plantilla común con colores propios
 *  - paleta: colores de cada letra
 *
 * Para agregar un luchador: copia una entrada, cambia la cabeza, los colores
 * y elige un tipo de especial existente (o crea uno nuevo en nucleo/pelea.js).
 */

const K = 0x181820;
const S = 0xf8c898; // piel

/** Plantilla del cuerpo (13 filas). A = ropa arriba · C = centro/cinturón · D = muñecas · P = pantalón · F = pies */
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

export const LUCHADORES = {
  raiko: {
    nombre: 'RAIKO',
    lema: 'Guerrero de energía',
    color: '#f08020',
    stats: { peso: 1.0, velocidad: 230, salto: 580 },
    golpe: { alcance: 30, daño: 6, empuje: 260, angulo: 35, duracion: 0.22 },
    especial: { tipo: 'proyectil', nombre: 'Onda de energía', carga: 0.3, velocidad: 420, radio: 10, daño: 12, empuje: 420, angulo: 30, color: 0x7fd8ff },
    paleta: { K, S, W: 0xffffff, H: 0x202030, A: 0xf08020, C: 0x2050c0, D: 0x2050c0, P: 0xf08020, F: 0x2050c0 },
    /** Mientras usa su especial, el pelo se vuelve dorado. */
    paletaPoder: { H: 0xffd84d },
    cabeza: [
      '....K...K.......',
      '...KHK.KHK.K....',
      '..KHHHKHHHKHK...',
      '.KHHHHHHHHHHHK..',
      'KHHHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK..',
      '..KHHSSSSSSHK...',
      '..KHSSSSKSSSK...',
      '..KSSSSSKSSSK...',
      '...KSSSSSSSK....',
      '....KSSSSSK.....',
    ],
  },

  kage: {
    nombre: 'KAGE',
    lema: 'Ninja de clones',
    color: '#f8a020',
    stats: { peso: 0.9, velocidad: 270, salto: 620 },
    golpe: { alcance: 28, daño: 5, empuje: 240, angulo: 40, duracion: 0.18 },
    especial: { tipo: 'clon', nombre: 'Clon de sombra', distancia: 200, duracion: 0.4, daño: 10, empuje: 380, angulo: 35 },
    paleta: { K, S, Y: 0xffd040, M: 0x9aa4b0, L: 0x40485a, B: 0x3070e0, A: 0xf89020, C: 0x303038, D: 0x303038, P: 0xf89020, F: 0x3050a0 },
    cabeza: [
      '.....K..K.......',
      '..K.KYKKYK.K....',
      '.KYKYYYYYYKYK...',
      'KYYYYYYYYYYYYK..',
      '.KMMMMMMMMMMMK..',
      '.KMMMMMLMMMMMK..',
      '..KYSSSSSSSYK...',
      '..KSSSSSBSSSK...',
      '..KSKSSSBSSKK...',
      '...KSSSSSSSK....',
      '....KSSSSSK.....',
    ],
  },

  rufo: {
    nombre: 'RUFO',
    lema: 'Pirata elástico',
    color: '#d02828',
    stats: { peso: 1.05, velocidad: 240, salto: 560 },
    golpe: { alcance: 34, daño: 7, empuje: 270, angulo: 30, duracion: 0.24 },
    especial: { tipo: 'estirar', nombre: 'Puño elástico', alcance: 150, duracion: 0.32, daño: 13, empuje: 430, angulo: 25 },
    paleta: { K, S, Y: 0xf0d060, R: 0xd02828, H: 0x202030, A: 0xd02828, C: S, D: S, P: 0x3060c0, F: 0xc89040 },
    cabeza: [
      '.....KKKKKK.....',
      '....KYYYYYYK....',
      '...KYYYYYYYYK...',
      '...KRRRRRRRRK...',
      'KKKYYYYYYYYYYKKK',
      '.KYYYYYYYYYYYYK.',
      '..KHHSSSSSSHK...',
      '..KHSSSSKSSSK...',
      '..KSSSSSKSSSK...',
      '...KSSSKKKSK....',
      '....KSSSSSK.....',
    ],
  },

  saya: {
    nombre: 'SAYA',
    lema: 'Espadachina cazadora',
    color: '#2a8a5a',
    stats: { peso: 0.95, velocidad: 255, salto: 590 },
    golpe: { alcance: 44, daño: 6, empuje: 250, angulo: 35, duracion: 0.22, espada: true },
    especial: { tipo: 'embestida', nombre: 'Corte veloz', distancia: 130, duracion: 0.25, daño: 11, empuje: 400, angulo: 30 },
    paleta: { K, S, H: 0x202030, A: 0x2a8a5a, C: 0x202030, D: S, P: 0x202030, F: 0x202030 },
    cabeza: [
      '................',
      '....KKKKKK......',
      '...KHHHHHHK.....',
      '..KHHHHHHHHK....',
      '.KHHHHHHHHHHK...',
      'KHHKHHHHHHHHK...',
      'KHK.KHSSSSSHK...',
      'KHK.KSSSSKSSK...',
      '.K..KSSSSKSSK...',
      '....KSSSSSSK....',
      '....KSSSSSK.....',
    ],
  },
};

/** Arte completo (16×24) de un luchador: su cabeza + la plantilla del cuerpo. */
export const arteDe = (id) => [...LUCHADORES[id].cabeza, ...CUERPO];
