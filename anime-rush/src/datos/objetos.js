/**
 * Objetos que caen al escenario de vez en cuando.
 * efecto: qué pasa al tocarlo (ver nucleo/pelea.js → tocarObjeto)
 */
export const OBJETOS = {
  comida: { nombre: 'Onigiri', efecto: 'curar', cantidad: 25, peso: 45, color: 0xf8f8f8 },
  bomba: { nombre: 'Bomba', efecto: 'explotar', daño: 14, empuje: 420, peso: 30, color: 0x303038 },
  esfera: { nombre: 'Esfera de poder', efecto: 'potenciar', multiplicador: 1.8, peso: 25, color: 0xffb020 },
};

/** Cada cuántos segundos cae un objeto (si está activado). */
export const SEGUNDOS_ENTRE_OBJETOS = 9;
