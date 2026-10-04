/**
 * Niveles: cada uno tiene un mapa de muros y una velocidad.
 * Para agregar un nivel, agrega un objeto a la lista.
 * Regla: la fila 10 (donde empieza la serpiente) debe quedar libre.
 */

/** Esquinas: cuatro "L" cerca de las esquinas. */
function esquinas() {
  const muros = [];
  for (let i = 0; i < 4; i++) {
    muros.push({ x: 3 + i, y: 3 }, { x: 3, y: 3 + i });
    muros.push({ x: 16 - i, y: 3 }, { x: 16, y: 3 + i });
    muros.push({ x: 3 + i, y: 16 }, { x: 3, y: 16 - i });
    muros.push({ x: 16 - i, y: 16 }, { x: 16, y: 16 - i });
  }
  return muros;
}

/** Pasillos: dos barras horizontales con un hueco en el medio. */
function pasillos() {
  const muros = [];
  for (let x = 3; x <= 16; x++) {
    if (x === 9 || x === 10) continue;
    muros.push({ x, y: 6 }, { x, y: 14 });
  }
  return muros;
}

/** Quita casillas repetidas de una lista. */
function sinRepetidos(lista) {
  return lista.filter((m, i) => lista.findIndex((o) => o.x === m.x && o.y === m.y) === i);
}

export const NIVELES = [
  { mapa: () => [], velocidad: 1 },
  { mapa: () => sinRepetidos(esquinas()), velocidad: 0.85 },
  { mapa: () => sinRepetidos(pasillos()), velocidad: 0.72 },
];
