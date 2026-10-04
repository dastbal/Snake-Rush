/**
 * Arte de los mapas y de las personas.
 *
 * Losetas (tiles): 8×8 letras, se dibujan al doble (16×16 píxeles).
 * Personas: MEDIA figura de 8×16, se refleja para hacerla simétrica.
 * Cada letra es un color de la paleta; "." es transparente.
 */

const K = 0x181818;

// ---------- Losetas ----------
const PASTO = {
  arte: ['GGGGGGGG', 'GGLGGGGG', 'GGGGGGLG', 'GGGGGGGG', 'GGGGLGGG', 'GLGGGGGG', 'GGGGGGGG', 'GGGGGLGG'],
  paleta: { G: 0x98d878, L: 0x78c058 },
};

const TECHO = ['rrrrrrrr', 'RRRRRRRR', 'RRRRRRRR', 'rrrrrrrr', 'RRRRRRRR', 'RRRRRRRR', 'rrrrrrrr', 'RRRRRRRR'];

/**
 * Cada letra del mapa es una loseta.
 * base: 'pasto' = se pinta pasto debajo (para arte con transparencia)
 * solido: no se puede caminar · alto: pasto alto (criaturas salvajes)
 */
export const LOSETAS = {
  '.': { ...PASTO },
  ',': {
    arte: ['SSSSSSSS', 'SSSsSSSS', 'SSSSSSSS', 'SSSSSSsS', 'SsSSSSSS', 'SSSSSSSS', 'SSSSsSSS', 'SSSSSSSS'],
    paleta: { S: 0xf0e0a8, s: 0xd8c488 },
  },
  h: {
    arte: ['GDGGDGGD', 'DDGDDGDD', 'DLDDLDLD', 'DDDDDDDD', 'GDGGDGGD', 'DDGDDGDD', 'DLDDLDLD', 'DDDDDDDD'],
    paleta: { G: 0x98d878, D: 0x48a048, L: 0x307830 },
    alto: true,
  },
  T: {
    base: 'pasto', solido: true,
    arte: ['..GGGG..', '.GGLGGG.', 'GGGGGLGG', 'GLGGGGGG', '.GGGGGG.', '..GGGG..', '...TT...', '..TTTT..'],
    paleta: { G: 0x308838, L: 0x58b058, T: 0x805830 },
  },
  '~': {
    solido: true,
    arte: ['BBBBBBBB', 'BLLBBBBB', 'BBBBBBBB', 'BBBBBLLB', 'BBBBBBBB', 'BBLLBBBB', 'BBBBBBBB', 'BBBBBBLL'],
    paleta: { B: 0x5898f8, L: 0xa8d0ff },
  },
  f: {
    base: 'pasto',
    arte: ['........', '.R...W..', 'RYR.WYW.', '.R...W..', '........', '...R....', '..RYR...', '...R....'],
    paleta: { R: 0xf05050, W: 0xf8f8f8, Y: 0xf8d030 },
  },
  F: {
    base: 'pasto', solido: true,
    arte: ['........', '.M....M.', 'MMMMMMMM', '.M....M.', '.M....M.', 'MMMMMMMM', '.M....M.', '........'],
    paleta: { M: 0xa07040 },
  },
  S: {
    base: 'pasto', solido: true,
    arte: ['........', 'MMMMMMMM', 'MWWWWWWM', 'MWKKKKWM', 'MWWWWWWM', 'MMMMMMMM', '...MM...', '...MM...'],
    paleta: { M: 0xa07040, W: 0xf0e0c0, K },
  },
  // Techos: el mismo dibujo con distintos colores
  R: { solido: true, arte: TECHO, paleta: { R: 0xd84838, r: 0xa83028 } },
  B: { solido: true, arte: TECHO, paleta: { R: 0x4878d8, r: 0x3058a8 } },
  P: { solido: true, arte: TECHO, paleta: { R: 0xf080a8, r: 0xc85880 } },
  M: { solido: true, arte: TECHO, paleta: { R: 0x9858d0, r: 0x7038a8 } },
  W: {
    solido: true,
    arte: ['WWWWWWWW', 'WWWWWWWW', 'wwwwwwww', 'WWWWWWWW', 'WWWWWWWW', 'wwwwwwww', 'WWWWWWWW', 'WWWWWWWW'],
    paleta: { W: 0xf8f0d8, w: 0xd8c8a8 },
  },
  V: {
    solido: true,
    arte: ['WWWWWWWW', 'WKKKKKKW', 'WKBBLBKW', 'WKBLBBKW', 'WKKKKKKW', 'wwwwwwww', 'WWWWWWWW', 'WWWWWWWW'],
    paleta: { W: 0xf8f0d8, w: 0xd8c8a8, K: 0x705838, B: 0x88b8f0, L: 0xd0e8ff },
  },
  D: {
    arte: ['WMMMMMMW', 'WMDDDDMW', 'WMDDDDMW', 'WMDDDDMW', 'WMDDDYMW', 'WMDDDDMW', 'WMDDDDMW', 'WMDDDDMW'],
    paleta: { W: 0xf8f0d8, M: 0x603818, D: 0x905828, Y: 0xf8d030 },
  },
};

// ---------- Personas ----------
// Plantilla de frente y de espaldas. R = gorra o pelo, B = camisa, D = pantalón.
const FRENTE = [
  '....KKKK', '...KRRRR', '..KRRRRR', '..KKKKKK', '..KSSSSS', '..KSKSSS', '..KSSSSS', '...KSSSS',
  '..KBBBBB', '.KSKBBBB', '.KSKBBBB', '..KKBBBB', '...KDDDD', '...KDDK.', '...KDDK.', '...KKKK.',
];
const ESPALDA = [
  '....KKKK', '...KRRRR', '..KRRRRR', '..KRRRRR', '..KHHHHH', '..KHHHHH', '..KHHHHH', '...KHHHH',
  '..KBBBBB', '.KSKBBBB', '.KSKBBBB', '..KKBBBB', '...KDDDD', '...KDDK.', '...KDDK.', '...KKKK.',
];

function persona(R, B, D, H = 0x6b3a1e) {
  return { frente: FRENTE, espalda: ESPALDA, paleta: { K, R, B, D, H, S: 0xf8c898 } };
}

/** Para agregar una persona: elige colores de gorra/pelo, camisa y pantalón. */
export const PERSONAS = {
  jugador: persona(0xe03030, 0x3060d0, 0x303860),
  aldeano: persona(0x6b3a1e, 0x50a050, 0x5a4030),
  nino: persona(0x3070e0, 0xf0c030, 0x3050a0),
  lider: persona(0xf8d030, 0x9050d0, 0x402060, 0xf8d030),
  profesor: persona(0xc8c8c8, 0xf8f8f8, 0x606060, 0xc8c8c8),
};
