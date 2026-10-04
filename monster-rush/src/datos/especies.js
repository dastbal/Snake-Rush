/**
 * Especies de criaturas.
 *
 * Para agregar una criatura nueva, copia una entrada y cambia:
 *  - nombre, tipos, base (estadísticas), expBase, captura (0-255, más = más fácil)
 *  - aprende: [nivel, ataque] (ataques de src/datos/ataques.js)
 *  - evoluciona: { nivel, a: 'otraEspecie' } (opcional)
 *  - arte: MEDIA criatura de 8 columnas × 16 filas; se refleja para hacerla simétrica.
 *    Cada letra es un color de `paleta`; "." es transparente. K = contorno.
 * Después agrégala a algún encuentro en src/datos/mapas.js.
 */

const K = 0x181818;
const W = 0xf8f8f8;

export const ESPECIES = {
  // ---------- Iniciales ----------
  flamix: {
    nombre: 'FLAMIX', tipos: ['fuego'],
    base: { ps: 39, ataque: 52, defensa: 43, velocidad: 65 }, expBase: 62, captura: 45,
    aprende: [[1, 'arañazo'], [1, 'gruñido'], [5, 'ascuas'], [8, 'ataqueRapido'], [12, 'llamarada']],
    evoluciona: { nivel: 9, a: 'flamaro' },
    paleta: { K, W, O: 0xf08030, Y: 0xffd040, R: 0xd03018 },
    arte: [
      '.......Y', '......YR', '......RO', '....KKKK', '...KOOOO', '..KOOOOO', '..KOWKOO', '..KOKKOO',
      '..KOOOOO', '...KOOYY', '..KKOOYY', '.KOOKOYY', '..KKOOYY', '...KOOOO', '...KOKKK', '...KK...',
    ],
  },
  flamaro: {
    nombre: 'FLAMARO', tipos: ['fuego'],
    base: { ps: 58, ataque: 64, defensa: 58, velocidad: 80 }, expBase: 142, captura: 45,
    aprende: [[1, 'arañazo'], [1, 'gruñido'], [5, 'ascuas'], [8, 'ataqueRapido'], [12, 'llamarada'], [15, 'mordisco']],
    paleta: { K, W, O: 0xe85820, Y: 0xffd040, R: 0xb82010 },
    arte: [
      '..R....Y', '..RR..YR', '...RRRRO', '...KKKKK', '..KOOOOO', '.KOOOOOO', '.KOWKROO', '.KOKKOOO',
      '.KOOOOOO', '..KOOOYY', 'KKOOOOYY', 'KOOKKOYY', '.KKOOOYY', '..KOOOOO', '..KOOKKK', '..KKK...',
    ],
  },
  gotin: {
    nombre: 'GOTÍN', tipos: ['agua'],
    base: { ps: 44, ataque: 48, defensa: 65, velocidad: 43 }, expBase: 63, captura: 45,
    aprende: [[1, 'placaje'], [1, 'gruñido'], [5, 'burbuja'], [11, 'mordisco'], [13, 'pistolaAgua']],
    evoluciona: { nivel: 9, a: 'mareon' },
    paleta: { K, W, B: 0x6890f0, L: 0xb8d0ff },
    arte: [
      '......KK', '.....KBB', '....KBBB', '...KBLBB', '..KBLBBB', '..KBBBBB', '.KBBWKBB', '.KBBKKBB',
      '.KBBBBBB', '.KBBBBBW', '.KBBBBWW', '..KBBBBB', '...KBBBB', '....KKBB', '......KK', '........',
    ],
  },
  mareon: {
    nombre: 'MAREÓN', tipos: ['agua'],
    base: { ps: 59, ataque: 63, defensa: 80, velocidad: 58 }, expBase: 142, captura: 45,
    aprende: [[1, 'placaje'], [1, 'gruñido'], [5, 'burbuja'], [11, 'mordisco'], [13, 'pistolaAgua']],
    paleta: { K, W, B: 0x5878e0, L: 0xb8d0ff, D: 0x3050b0 },
    arte: [
      '...D...K', '...DD.KB', '....DKBB', '....KBBB', '...KBLBB', '..KBLBBB', '.KBBBBBB', 'KBBBWKBB',
      'KBBBKKBB', 'KBBBBBBB', 'KBBBBBBW', '.KBBBBWW', '.KDBBBBB', '..KDBBBB', '...KKKBB', '......KK',
    ],
  },
  brotin: {
    nombre: 'BROTÍN', tipos: ['planta'],
    base: { ps: 45, ataque: 49, defensa: 49, velocidad: 45 }, expBase: 64, captura: 45,
    aprende: [[1, 'placaje'], [1, 'gruñido'], [5, 'latigo'], [10, 'descanso'], [13, 'hojaAfilada']],
    evoluciona: { nivel: 9, a: 'floreton' },
    paleta: { K, W, G: 0x48a048, L: 0x90e070, C: 0x78c8a0 },
    arte: [
      '.......G', '......GG', '..GG...G', '.GLLG..G', '.GLLLGGG', '..GGGKKK', '...KCCCC', '..KCCCCC',
      '..KCWKCC', '..KCKKCC', '..KCCCCC', '..KCCCCC', '...KCCCC', '...KCKKK', '...KK...', '........',
    ],
  },
  floreton: {
    nombre: 'FLORETÓN', tipos: ['planta'],
    base: { ps: 60, ataque: 62, defensa: 63, velocidad: 60 }, expBase: 141, captura: 45,
    aprende: [[1, 'placaje'], [1, 'gruñido'], [5, 'latigo'], [10, 'descanso'], [13, 'hojaAfilada']],
    paleta: { K, W, G: 0x389038, L: 0x90e070, C: 0x68b890, P: 0xf080b0, Y: 0xffe060 },
    arte: [
      '...PPPYY', '..PPPPYY', '..PPPPPP', '.GGPPPGG', 'GLLGGGGG', 'GLLLGKKK', '.GGGKCCC', '..KCCCCC',
      '.KCCWKCC', '.KCCKKCC', '.KCCCCCC', '.KCCCCCC', '..KCCCCC', '..KCCKKK', '..KKK...', '........',
    ],
  },

  // ---------- Salvajes ----------
  ratin: {
    nombre: 'RATÍN', tipos: ['normal'],
    base: { ps: 30, ataque: 56, defensa: 35, velocidad: 72 }, expBase: 51, captura: 255,
    aprende: [[1, 'placaje'], [1, 'malicioso'], [4, 'ataqueRapido'], [8, 'mordisco']],
    evoluciona: { nivel: 10, a: 'ratonazo' },
    paleta: { K, W, N: 0xa07850, P: 0xf0a0b0 },
    arte: [
      '..KK....', '.KPPK...', '.KPPK...', '..KKKKKK', '...KNNNN', '..KNNNNN', '..KNWKNN', '..KNKKNN',
      '..KNNNNN', '...KNNNK', '...KNNNN', '..KNNNNN', '..KNNNNN', '...KNNNN', '...KNKKK', '...KK...',
    ],
  },
  ratonazo: {
    nombre: 'RATONAZO', tipos: ['normal'],
    base: { ps: 55, ataque: 81, defensa: 60, velocidad: 97 }, expBase: 145, captura: 127,
    aprende: [[1, 'placaje'], [1, 'malicioso'], [4, 'ataqueRapido'], [8, 'mordisco']],
    paleta: { K, W, N: 0x8a6040, P: 0xf0a0b0 },
    arte: [
      '.KK.....', 'KPPK....', 'KPPPK...', '.KKKKKKK', '..KNNNNN', '.KNNNNNN', '.KNWKNNN', '.KNKKNNN',
      '.KNNNNNN', '..KNNNNK', '..KNNNWW', '.KNNNNNN', '.KNNNNNN', '..KNNNNN', '..KNNKKK', '..KKK...',
    ],
  },
  pipio: {
    nombre: 'PIPÍO', tipos: ['normal', 'volador'],
    base: { ps: 40, ataque: 45, defensa: 40, velocidad: 56 }, expBase: 50, captura: 255,
    aprende: [[1, 'picotazo'], [1, 'gruñido'], [5, 'ataqueRapido'], [9, 'ataqueAla']],
    paleta: { K, W, B: 0xc08850, E: 0xe8d0a0, Y: 0xf0c030, C: 0xf8e8c8 },
    arte: [
      '........', '.....KKK', '....KBBB', '...KBBBB', '...KBWKB', '...KBKKB', '...KBBBY', '..KBBBBB',
      '.KEKBBBB', 'KEEKBBBB', '.KEKBCCC', '..KKBCCC', '...KBBCC', '....KYKY', '....KY..', '........',
    ],
  },
  chispon: {
    nombre: 'CHISPÓN', tipos: ['electrico'],
    base: { ps: 35, ataque: 55, defensa: 30, velocidad: 90 }, expBase: 82, captura: 190,
    aprende: [[1, 'impactrueno'], [1, 'gruñido'], [6, 'ataqueRapido'], [10, 'chispazo']],
    paleta: { K, W, Y: 0xf8d030, R: 0xe04030 },
    arte: [
      'K......Y', 'YK....YY', '.YK..KKK', '..KKKYYY', '..KYYYYY', '.KYYYYYY', '.KYYWKYY', '.KYYKKYY',
      '.KYRRYYY', '.KYRRYYY', '.KYYYYKK', '..KYYYYY', '..KYYYYY', '...KYYYY', '....KKKK', '........',
    ],
  },
  hojita: {
    nombre: 'HOJITA', tipos: ['planta'],
    base: { ps: 40, ataque: 40, defensa: 45, velocidad: 50 }, expBase: 52, captura: 255,
    aprende: [[1, 'placaje'], [3, 'latigo'], [7, 'descanso']],
    paleta: { K, W, G: 0x389038, L: 0x90e070, C: 0x98d050 },
    arte: [
      '........', '.......G', '......GG', '.....GLG', '....GLGG', '...KKKKK', '..KCCCCC', '..KCWKCC',
      '..KCKKCC', '..KCCCCC', '..KCCCCC', '...KCCCC', '..K.K.KK', '...KKKKK', '........', '........',
    ],
  },
  burbu: {
    nombre: 'BURBU', tipos: ['agua'],
    base: { ps: 40, ataque: 40, defensa: 35, velocidad: 70 }, expBase: 52, captura: 255,
    aprende: [[1, 'burbuja'], [1, 'malicioso'], [10, 'pistolaAgua']],
    paleta: { K, W, A: 0x60b8e8, L: 0xc0e8ff },
    arte: [
      '........', '....KKKK', '...KAAAA', '..KAALAA', '..KALAAA', '.KAAAAAA', '.KAAWKAA', '.KAAKKAA',
      '.KAAAAAA', '..KAAAKK', '...KKKAA', '...KA.KA', '..KA..KA', '..KA.KA.', '...K..K.', '........',
    ],
  },
  ascuin: {
    nombre: 'ASCUÍN', tipos: ['fuego'],
    base: { ps: 38, ataque: 41, defensa: 40, velocidad: 65 }, expBase: 60, captura: 190,
    aprende: [[1, 'ascuas'], [1, 'malicioso'], [8, 'mordisco']],
    paleta: { K, W, O: 0xe86828, Y: 0xffd040, R: 0xc83010 },
    arte: [
      '...R....', '..RYR...', '..ROR..R', '...KKKRY', '..KOOOKR', '.KOOOOOO', '.KOWKOOO', '.KOKKOOO',
      '.KOOOOOO', '..KOOOKK', '..KOOOOO', '...KOOOO', '..KOOOOO', '..KOKKKK', '..KK....', '........',
    ],
  },
};

/** Las tres criaturas que ofrece el profesor. */
export const INICIALES = ['flamix', 'gotin', 'brotin'];
