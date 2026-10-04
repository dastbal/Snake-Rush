/**
 * Convierte dibujos de letras en imágenes (ADR 0004). Lo usan todos los juegos.
 *
 *   lienzo(['.KK.', 'KOOK'], { K: 0x000000, O: 0xff8800 }, 2)  →  <canvas>
 *
 * Cada letra es un color de la paleta; "." es transparente.
 */
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

/** Pinta un dibujo de letras en un canvas nuevo (opcionalmente sobre un fondo). */
export function lienzo(filas, paleta, escala = 1, fondo = null) {
  const c = document.createElement('canvas');
  c.width = filas[0].length * escala;
  c.height = filas.length * escala;
  const g = c.getContext('2d');
  if (fondo) g.drawImage(fondo, 0, 0, c.width, c.height);
  filas.forEach((fila, y) => {
    [...fila].forEach((letra, x) => {
      if (letra === '.') return;
      g.fillStyle = hex(paleta[letra]);
      g.fillRect(x * escala, y * escala, escala, escala);
    });
  });
  return c;
}

/** Refleja media figura (de izquierda a derecha) para hacerla simétrica. */
export const reflejar = (filas) => filas.map((f) => f + [...f].reverse().join(''));
