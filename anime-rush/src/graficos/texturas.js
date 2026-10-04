/**
 * Texturas de los luchadores (Phaser) y retratos para los menús (HTML).
 */
import { LUCHADORES, arteDe } from '../datos/luchadores.js';
import { lienzo } from '../../../compartido/pixelart.js';

/** Los luchadores ya miden 32×51: se dibujan a tamaño real (1 letra = 1 píxel). */
export const ESCALA = 1;

export function crearTexturas(escena) {
  for (const [id, l] of Object.entries(LUCHADORES)) {
    const agregar = (clave, canvas) => {
      if (!escena.textures.exists(clave)) escena.textures.addCanvas(clave, canvas);
    };
    agregar(`l-${id}`, lienzo(arteDe(id), l.paleta, ESCALA));
    // Versión "con poder" (por ejemplo, el pelo dorado de GOKU al usar su especial)
    agregar(`l-${id}-poder`, lienzo(arteDe(id), { ...l.paleta, ...(l.paletaPoder || {}) }, ESCALA));
  }
}

/** Retrato de un luchador para los menús y el marcador. */
export function retrato(id, escala = 4) {
  return lienzo(arteDe(id), LUCHADORES[id].paleta, escala).toDataURL();
}
