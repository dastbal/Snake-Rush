/**
 * Convierte los dibujos de letras en imágenes.
 * Se usan como texturas de Phaser y también como <img> en los menús.
 */
import { ESPECIES } from '../datos/especies.js';
import { LOSETAS, PERSONAS } from '../datos/sprites.js';
import { lienzo, reflejar } from '../../../compartido/pixelart.js';

export { lienzo }; // la portada lo usa para sus vistas previas

export const LOSETA = 16; // píxeles por casilla

/** Imagen de una criatura (16×16 × escala), para menús HTML. */
export function imagenCriatura(especie, escala = 3) {
  const e = ESPECIES[especie];
  return lienzo(reflejar(e.arte), e.paleta, escala).toDataURL();
}

/** Crea todas las texturas del juego dentro de Phaser. */
export function crearTexturas(escena) {
  const agregar = (clave, canvas) => {
    if (!escena.textures.exists(clave)) escena.textures.addCanvas(clave, canvas);
  };
  const pasto = lienzo(LOSETAS['.'].arte, LOSETAS['.'].paleta, 2);
  for (const [letra, l] of Object.entries(LOSETAS)) {
    agregar(`t-${letra}`, lienzo(l.arte, l.paleta, 2, l.base === 'pasto' ? pasto : null));
  }
  for (const [id, p] of Object.entries(PERSONAS)) {
    agregar(`p-${id}-frente`, lienzo(reflejar(p.frente), p.paleta));
    agregar(`p-${id}-espalda`, lienzo(reflejar(p.espalda), p.paleta));
  }
  for (const [id, e] of Object.entries(ESPECIES)) {
    agregar(`c-${id}`, lienzo(reflejar(e.arte), e.paleta));
  }
}
